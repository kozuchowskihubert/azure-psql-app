terraform {
  backend "azurerm" {
    resource_group_name  = "notesapp-dev-rg"
    storage_account_name = "tfstatenotesapp"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
