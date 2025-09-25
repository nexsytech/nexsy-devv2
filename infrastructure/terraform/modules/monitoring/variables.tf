# Monitoring Module Variables

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "billing_account" {
  description = "GCP Billing Account ID"
  type        = string
  default     = ""
}

variable "monthly_budget_amount" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 100
}

variable "budget_alert_threshold" {
  description = "Budget alert threshold (0.0 - 1.0)"
  type        = number
  default     = 0.8
}

variable "alert_email" {
  description = "Email address for alert notifications"
  type        = string
  default     = "alerts@nexsy.app"
}

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  default     = ""
  sensitive   = true
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default = {
    managed_by = "terraform"
  }
}