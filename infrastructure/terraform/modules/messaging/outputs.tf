# Messaging Module Outputs

output "topics" {
  description = "All Pub/Sub topic information"
  value = {
    content_generation = {
      name = google_pubsub_topic.content_generation.name
      id   = google_pubsub_topic.content_generation.id
    }
    campaign_operations = {
      name = google_pubsub_topic.campaign_operations.name
      id   = google_pubsub_topic.campaign_operations.id
    }
    optimization_events = {
      name = google_pubsub_topic.optimization_events.name
      id   = google_pubsub_topic.optimization_events.id
    }
    platform_webhooks = {
      name = google_pubsub_topic.platform_webhooks.name
      id   = google_pubsub_topic.platform_webhooks.id
    }
    analytics_events = {
      name = google_pubsub_topic.analytics_events.name
      id   = google_pubsub_topic.analytics_events.id
    }
    dead_letter = {
      name = google_pubsub_topic.dead_letter.name
      id   = google_pubsub_topic.dead_letter.id
    }
  }
}

output "subscriptions" {
  description = "All Pub/Sub subscription information"
  value = {
    content_generation = {
      name = google_pubsub_subscription.content_generation_sub.name
      id   = google_pubsub_subscription.content_generation_sub.id
    }
    campaign_operations = {
      name = google_pubsub_subscription.campaign_operations_sub.name
      id   = google_pubsub_subscription.campaign_operations_sub.id
    }
    optimization_events = {
      name = google_pubsub_subscription.optimization_events_sub.name
      id   = google_pubsub_subscription.optimization_events_sub.id
    }
    platform_webhooks = {
      name = google_pubsub_subscription.platform_webhooks_sub.name
      id   = google_pubsub_subscription.platform_webhooks_sub.id
    }
    analytics_events = {
      name = google_pubsub_subscription.analytics_events_sub.name
      id   = google_pubsub_subscription.analytics_events_sub.id
    }
    dead_letter = {
      name = google_pubsub_subscription.dead_letter_sub.name
      id   = google_pubsub_subscription.dead_letter_sub.id
    }
  }
}

output "topic_names" {
  description = "Topic names for application configuration"
  value = {
    content_generation  = google_pubsub_topic.content_generation.name
    campaign_operations = google_pubsub_topic.campaign_operations.name
    optimization_events = google_pubsub_topic.optimization_events.name
    platform_webhooks  = google_pubsub_topic.platform_webhooks.name
    analytics_events    = google_pubsub_topic.analytics_events.name
    dead_letter        = google_pubsub_topic.dead_letter.name
  }
}