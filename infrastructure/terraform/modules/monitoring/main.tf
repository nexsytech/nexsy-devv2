# Monitoring Module - Cloud Monitoring, alerting, and budgets

# Create notification channel for alerts
resource "google_monitoring_notification_channel" "email" {
  display_name = "Email Notifications (${var.environment})"
  type         = "email"
  
  labels = {
    email_address = var.alert_email
  }

  enabled = true
}

# Create notification channel for Slack (if configured)
resource "google_monitoring_notification_channel" "slack" {
  count        = var.slack_webhook_url != "" ? 1 : 0
  display_name = "Slack Notifications (${var.environment})"
  type         = "slack"
  
  labels = {
    url = var.slack_webhook_url
  }

  enabled = true
}

# Budget alert (disabled - requires proper quota project setup)
resource "google_billing_budget" "monthly_budget" {
  count           = 0  # Disabled - requires proper quota project setup
  billing_account = var.billing_account
  display_name    = "Nexsy Monthly Budget (${var.environment})"

  budget_filter {
    projects = ["projects/${var.project_id}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = tostring(var.monthly_budget_amount)
    }
  }

  threshold_rules {
    threshold_percent = var.budget_alert_threshold
    spend_basis      = "CURRENT_SPEND"
  }

  threshold_rules {
    threshold_percent = 0.9
    spend_basis      = "FORECASTED_SPEND"
  }

  all_updates_rule {
    monitoring_notification_channels = [google_monitoring_notification_channel.email.name]
    disable_default_iam_recipients   = false
  }
}

# Alert policy for high error rate
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate (${var.environment})"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run service error rate"
    
    condition_threshold {
      filter         = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND resource.labels.service_name:\"nexsy-api-${var.environment}\""
      comparison     = "COMPARISON_GT"
      threshold_value = 0.05  # 5% error rate
      duration       = "300s"  # 5 minutes

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields = ["resource.labels.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"  # 30 minutes
  }

  enabled = true
}

# Alert policy for high latency
resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High Latency (${var.environment})"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Run service high latency"
    
    condition_threshold {
      filter         = "metric.type=\"run.googleapis.com/request_latencies\" AND resource.type=\"cloud_run_revision\" AND resource.labels.service_name:\"nexsy-api-${var.environment}\""
      comparison     = "COMPARISON_GT"
      threshold_value = 2000  # 2 seconds
      duration       = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_DELTA"
        cross_series_reducer = "REDUCE_PERCENTILE_95"
        group_by_fields = ["resource.labels.service_name"]
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }

  enabled = true
}

# Alert policy for Firestore errors (disabled - metric/resource mismatch)
resource "google_monitoring_alert_policy" "firestore_errors" {
  count = 0  # Disabled - invalid metric/resource combination
  display_name = "Firestore Errors (${var.environment})"
  combiner     = "OR"

  conditions {
    display_name = "Firestore operation errors"
    
    condition_threshold {
      filter         = "resource.type=\"global\" AND metric.type=\"firestore.googleapis.com/api/request_count\""
      comparison     = "COMPARISON_GT"
      threshold_value = 10  # 10 errors per minute
      duration       = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }

  enabled = true
}

# Alert policy for Cloud Storage quota
resource "google_monitoring_alert_policy" "storage_quota" {
  display_name = "Storage Quota Warning (${var.environment})"
  combiner     = "OR"

  conditions {
    display_name = "Cloud Storage quota usage"
    
    condition_threshold {
      filter         = "resource.type=\"gcs_bucket\" AND metric.type=\"storage.googleapis.com/storage/total_bytes\""
      comparison     = "COMPARISON_GT"
      threshold_value = 50 * 1024 * 1024 * 1024  # 50GB
      duration       = "0s"

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_SUM"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "3600s"  # 1 hour
  }

  enabled = true
}

# Alert policy for failed Pub/Sub messages
resource "google_monitoring_alert_policy" "pubsub_dead_letter" {
  display_name = "Pub/Sub Dead Letter Messages (${var.environment})"
  combiner     = "OR"

  conditions {
    display_name = "Messages in dead letter queue"
    
    condition_threshold {
      filter         = "resource.type=\"pubsub_subscription\" AND resource.labels.subscription_id=\"dead-letter-sub-${var.environment}\" AND metric.type=\"pubsub.googleapis.com/subscription/num_undelivered_messages\""
      comparison     = "COMPARISON_GT"
      threshold_value = 5
      duration       = "300s"

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]

  alert_strategy {
    auto_close = "1800s"
  }

  enabled = true
}

# Create custom dashboard
resource "google_monitoring_dashboard" "nexsy_dashboard" {
  dashboard_json = jsonencode({
    displayName = "Nexsy Dashboard (${var.environment})"
    
    gridLayout = {
      widgets = [
        {
          title = "Cloud Run Request Count"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND resource.labels.service_name:\"nexsy-api-${var.environment}\""
                  aggregation = {
                    alignmentPeriod = "60s"
                    perSeriesAligner = "ALIGN_RATE"
                    crossSeriesReducer = "REDUCE_SUM"
                    groupByFields = ["resource.labels.service_name"]
                  }
                }
              }
              plotType = "LINE"
            }]
            timeshiftDuration = "0s"
            yAxis = {
              label = "Requests/sec"
              scale = "LINEAR"
            }
          }
        },
        {
          title = "Error Rate by Service"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\" AND resource.labels.service_name:\"nexsy-api-${var.environment}\""
                  aggregation = {
                    alignmentPeriod = "300s"
                    perSeriesAligner = "ALIGN_RATE"
                    crossSeriesReducer = "REDUCE_MEAN"
                    groupByFields = ["resource.labels.service_name"]
                  }
                }
              }
              plotType = "LINE"
            }]
            yAxis = {
              label = "Error Rate"
              scale = "LINEAR"
            }
          }
        },
        {
          title = "Firestore Operations"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "resource.type=\"global\" AND metric.type=\"firestore.googleapis.com/api/request_count\""
                  aggregation = {
                    alignmentPeriod = "60s"
                    perSeriesAligner = "ALIGN_RATE"
                    crossSeriesReducer = "REDUCE_SUM"
                  }
                }
              }
              plotType = "STACKED_AREA"
            }]
            yAxis = {
              label = "Operations/sec"
              scale = "LINEAR"
            }
          }
        },
        {
          title = "Pub/Sub Message Count"
          xyChart = {
            dataSets = [{
              timeSeriesQuery = {
                timeSeriesFilter = {
                  filter = "metric.type=\"pubsub.googleapis.com/topic/send_message_operation_count\" AND resource.type=\"pubsub_topic\" AND resource.labels.topic_id:\"content-generation-${var.environment}\""
                  aggregation = {
                    alignmentPeriod = "60s"
                    perSeriesAligner = "ALIGN_RATE"
                    crossSeriesReducer = "REDUCE_SUM"
                    groupByFields = ["resource.labels.topic_id"]
                  }
                }
              }
              plotType = "LINE"
            }]
            yAxis = {
              label = "Messages/sec"
              scale = "LINEAR"
            }
          }
        }
      ]
    }
  })
}

# SLO for API availability (production only)
resource "google_monitoring_slo" "api_availability" {
  count        = var.environment == "production" ? 1 : 0
  service      = google_monitoring_service.nexsy_api[0].service_id
  display_name = "API Availability SLO"
  
  goal                = 0.999  # 99.9% availability
  rolling_period_days = 30

  request_based_sli {
    good_total_ratio {
      total_service_filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"nexsy-api-${var.environment}\""
      good_service_filter  = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"nexsy-api-${var.environment}\" AND metric.labels.response_code_class=\"2xx\""
    }
  }
}

# Service for SLO monitoring (production only)
resource "google_monitoring_service" "nexsy_api" {
  count        = var.environment == "production" ? 1 : 0
  service_id   = "nexsy-api-${var.environment}"
  display_name = "Nexsy API Service"
  
  basic_service {
    service_type = "CLOUD_RUN"
    service_labels = {
      service_name = "nexsy-api-${var.environment}"
    }
  }
}