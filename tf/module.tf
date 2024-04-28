module "backend-state" {
  source      = "miladbeigi/backend-state/aws"
  version     = "0.2.1"
  bucket_name = "milad-cloud-terraform-state"
}
