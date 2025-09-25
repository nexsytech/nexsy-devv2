# Messaging Module - Pub/Sub topics and subscriptions

# Content Generation Topic
resource "google_pubsub_topic" "content_generation" {
  name    = "content-generation-${var.environment}"
  project = var.project_id

  labels = merge(var.labels, {
    environment = var.environment
    service     = "content-generation"
  })

  message_retention_duration = "604800s" # 7 days
}

# Content Generation Subscription
resource "google_pubsub_subscription" "content_generation_sub" {
  name    = "content-generation-sub-${var.environment}"
  topic   = google_pubsub_topic.content_generation.name
  project = var.project_id

  message_retention_duration = "604800s" # 7 days
  retain_acked_messages      = false
  ack_deadline_seconds       = 60

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = 5
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "content-generation"
  })
}

# Campaign Operations Topic
resource "google_pubsub_topic" "campaign_operations" {
  name    = "campaign-operations-${var.environment}"
  project = var.project_id

  labels = merge(var.labels, {
    environment = var.environment
    service     = "campaign-management"
  })

  message_retention_duration = "604800s" # 7 days
}

# Campaign Operations Subscription
resource "google_pubsub_subscription" "campaign_operations_sub" {
  name    = "campaign-operations-sub-${var.environment}"
  topic   = google_pubsub_topic.campaign_operations.name
  project = var.project_id

  message_retention_duration = "604800s"
  retain_acked_messages      = false
  ack_deadline_seconds       = 120 # Longer for campaign operations

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = 5
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "campaign-management"
  })
}

# Optimization Events Topic
resource "google_pubsub_topic" "optimization_events" {
  name    = "optimization-events-${var.environment}"
  project = var.project_id

  labels = merge(var.labels, {
    environment = var.environment
    service     = "optimization"
  })

  message_retention_duration = "604800s"
}

# Optimization Events Subscription
resource "google_pubsub_subscription" "optimization_events_sub" {
  name    = "optimization-events-sub-${var.environment}"
  topic   = google_pubsub_topic.optimization_events.name
  project = var.project_id

  message_retention_duration = "604800s"
  retain_acked_messages      = false
  ack_deadline_seconds       = 60

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = 5
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "optimization"
  })
}

# Platform Webhooks Topic
resource "google_pubsub_topic" "platform_webhooks" {
  name    = "platform-webhooks-${var.environment}"
  project = var.project_id

  labels = merge(var.labels, {
    environment = var.environment
    service     = "webhooks"
  })

  message_retention_duration = "259200s" # 3 days (webhooks are time-sensitive)
}

# Platform Webhooks Subscription
resource "google_pubsub_subscription" "platform_webhooks_sub" {
  name    = "platform-webhooks-sub-${var.environment}"
  topic   = google_pubsub_topic.platform_webhooks.name
  project = var.project_id

  message_retention_duration = "259200s"
  retain_acked_messages      = false
  ack_deadline_seconds       = 30 # Quick processing for webhooks

  retry_policy {
    minimum_backoff = "1s"
    maximum_backoff = "60s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = 5
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "webhooks"
  })
}

# Analytics Events Topic (for future BigQuery integration)
resource "google_pubsub_topic" "analytics_events" {
  name    = "analytics-events-${var.environment}"
  project = var.project_id

  labels = merge(var.labels, {
    environment = var.environment
    service     = "analytics"
  })

  message_retention_duration = "604800s"
}

# Analytics Events Subscription
resource "google_pubsub_subscription" "analytics_events_sub" {
  name    = "analytics-events-sub-${var.environment}"
  topic   = google_pubsub_topic.analytics_events.name
  project = var.project_id

  message_retention_duration = "604800s"
  retain_acked_messages      = false
  ack_deadline_seconds       = 60

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = 5
  }

  labels = merge(var.labels, {
    environment = var.environment
    service     = "analytics"
  })
}

# Dead Letter Topic
resource "google_pubsub_topic" "dead_letter" {
  name    = "dead-letter-${var.environment}"
  project = var.project_id

  labels = merge(var.labels, {
    environment = var.environment
    service     = "dead-letter"
  })

  message_retention_duration = "2592000s" # 30 days
}

# Dead Letter Subscription (for monitoring failed messages)
resource "google_pubsub_subscription" "dead_letter_sub" {
  name    = "dead-letter-sub-${var.environment}"
  topic   = google_pubsub_topic.dead_letter.name
  project = var.project_id

  message_retention_duration = "2592000s"
  retain_acked_messages      = true
  ack_deadline_seconds       = 600

  labels = merge(var.labels, {
    environment = var.environment
    service     = "dead-letter"
  })
}

# IAM permissions for service accounts to publish/subscribe
resource "google_pubsub_topic_iam_member" "content_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.content_generation.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:nexsy-api-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_pubsub_subscription_iam_member" "content_subscriber" {
  project      = var.project_id
  subscription = google_pubsub_subscription.content_generation_sub.name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:nexsy-content-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_pubsub_topic_iam_member" "campaign_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.campaign_operations.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:nexsy-api-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_pubsub_subscription_iam_member" "campaign_subscriber" {
  project      = var.project_id
  subscription = google_pubsub_subscription.campaign_operations_sub.name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:nexsy-campaign-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_pubsub_topic_iam_member" "optimization_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.optimization_events.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:nexsy-campaign-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_pubsub_subscription_iam_member" "optimization_subscriber" {
  project      = var.project_id
  subscription = google_pubsub_subscription.optimization_events_sub.name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:nexsy-optimization-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_pubsub_topic_iam_member" "webhook_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.platform_webhooks.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:nexsy-functions-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}

resource "google_pubsub_subscription_iam_member" "webhook_subscriber" {
  project      = var.project_id
  subscription = google_pubsub_subscription.platform_webhooks_sub.name
  role         = "roles/pubsub.subscriber"
  member       = "serviceAccount:nexsy-campaign-${var.environment}@${var.project_id}.iam.gserviceaccount.com"
}