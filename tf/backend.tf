terraform {
  backend "s3" {
    bucket         = "milad-cloud-terraform-state"
    key            = "milad.cloud/state.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-state-db"
  }
}
