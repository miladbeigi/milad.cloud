provider "aws" {
  region = "eu-west-1"
}

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

terraform {
  backend "s3" {
    bucket         = "milad-cloud-terraform-state"
    key            = "milad.cloud/state.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-state-db"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.47.0"
    }
  }
}
