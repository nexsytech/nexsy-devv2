# Monitoring Module Outputs

output "notification_channels" {
  description = "Notification channel information"
  value = {
    email = {
      name = google_monitoring_notification_channel.email.name
      id   = google_monitoring_notification_channel.email.id
    }
    slack = var.slack_webhook_url != "" ? {
      name = google_monitoring_notification_channel.slack[0].name
      id   = google_monitoring_notification_channel.slack[0].id
    } : null
  }
}

output "alert_policies" {
  description = "Alert policy information"
  value = {
    high_error_rate = {
      name = google_monitoring_alert_policy.high_error_rate.name
      id   = google_monitoring_alert_policy.high_error_rate.id
    }
    high_latency = {
      name = google_monitoring_alert_policy.high_latency.name
      id   = google_monitoring_alert_policy.high_latency.id
    }
    # firestore_errors alert disabled due to metric/resource mismatch
    storage_quota = {
      name = google_monitoring_alert_policy.storage_quota.name
      id   = google_monitoring_alert_policy.storage_quota.id
    }
    pubsub_dead_letter = {
      name = google_monitoring_alert_policy.pubsub_dead_letter.name
      id   = google_monitoring_alert_policy.pubsub_dead_letter.id
    }
  }
}

output "dashboard_url" {
  description = "Cloud Monitoring dashboard URL"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${google_monitoring_dashboard.nexsy_dashboard.id}?project=${var.project_id}"
}

output "budget_name" {
  description = "Budget name"
  value       = null  # Budget creation disabled
}

output "slo_id" {
  description = "SLO ID (production only)"
  value       = var.environment == "production" ? google_monitoring_slo.api_availability[0].name : null
}