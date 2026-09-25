module "backend-state" {
  source      = "miladbeigi/backend-state/aws"
  version     = "0.2.1"
  bucket_name = "milad-cloud-terraform-state"
}

resource "aws_route53_zone" "main" {
  name = var.domain_name
}

resource "aws_route53_record" "main-a-record" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "main-www-record" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.s3_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_acm_certificate" "cert" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "records" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.main.zone_id
}

resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.records : record.fqdn]
}

resource "aws_s3_bucket" "website" {
  bucket = var.website_bucket_name
}

resource "aws_s3_bucket_server_side_encryption_configuration" "this" {
  bucket = aws_s3_bucket.website.bucket
  rule {

    bucket_key_enabled = false

    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# No longer used: CloudFront reads the bucket through its REST endpoint with OAC.
# Remove once the OAC migration has been applied, so the switch has no downtime.
resource "aws_s3_bucket_website_configuration" "this" {
  bucket = aws_s3_bucket.website.bucket
  error_document {
    key = "404.html"
  }

  index_document {
    suffix = "index.html"
  }

}

resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.website.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  # Swap the public policy for the CloudFront-only one before blocking public policies
  depends_on = [aws_s3_bucket_policy.this]
}

data "aws_iam_policy_document" "website" {
  statement {
    sid       = "AllowCloudFrontRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.website.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.s3_distribution.arn]
    }
  }

  # Lets CloudFront see missing keys as 404 instead of 403
  statement {
    sid       = "AllowCloudFrontList"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.website.arn]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.s3_distribution.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.website.id
  policy = data.aws_iam_policy_document.website.json
}

resource "aws_cloudfront_origin_access_control" "website" {
  name                              = var.website_bucket_name
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Maps /path/ to /path/index.html (the S3 REST origin has no index documents),
# adds trailing slashes, and serves the /toolbelt installer redirect.
resource "aws_cloudfront_function" "rewrite" {
  name    = "milad-cloud-rewrite"
  runtime = "cloudfront-js-2.0"
  publish = true
  code    = file("${path.module}/functions/rewrite.js")
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_cloudfront_response_headers_policy" "security" {
  name = "milad-cloud-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 63072000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }

    content_type_options {
      override = true
    }

    frame_options {
      frame_option = "DENY"
      override     = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }

    content_security_policy {
      content_security_policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
      override                = true
    }
  }
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  aliases             = [var.domain_name, "www.${var.domain_name}"]
  default_root_object = "index.html"
  enabled             = true
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"

  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
  }

  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
  }

  default_cache_behavior {
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    target_origin_id           = "website"
    viewer_protocol_policy     = "redirect-to-https"
    cache_policy_id            = data.aws_cloudfront_cache_policy.caching_optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.rewrite.arn
    }
  }

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "website"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.s3_distribution.id
}
