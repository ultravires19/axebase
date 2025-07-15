use std::net::SocketAddr;
use std::sync::Arc;

use dotenv::dotenv;
use sqlx::PgPool;
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod db;
mod models;
mod routes;
mod services;
mod utils;

use services::email::{EmailServiceImpl, SendGridEmailService};

// Application state shared across routes
#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub email_service: Arc<EmailServiceImpl>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables from .env file if it exists
    dotenv().ok();

    // Initialize tracing for request logging
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Database connection string
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/axebase".to_string());

    // Create and initialize database connection pool
    let pool = db::create_pool(&database_url).await?;

    // Run database migrations
    db::initialize(&pool).await?;

    // Configure email service
    let sendgrid_api_key = std::env::var("SENDGRID_API_KEY").expect("SENDGRID_API_KEY must be set");
    let from_email =
        std::env::var("EMAIL_FROM_ADDRESS").unwrap_or_else(|_| "auth@creditkiter.com".to_string());
    let from_name = std::env::var("EMAIL_FROM_NAME").unwrap_or_else(|_| "AxeBase".to_string());

    // Create the email service
    let email_service = Arc::new(EmailServiceImpl::SendGrid(SendGridEmailService::new(
        sendgrid_api_key,
        from_email,
        from_name,
    )));

    // Create application state to share between routes
    let app_state = AppState {
        pool,
        email_service,
    };

    // Configure middleware layers
    let middleware = ServiceBuilder::new()
        // Add request tracing
        .layer(TraceLayer::new_for_http());

    // Build the application with routes and middleware
    let app = routes::routes().with_state(app_state).layer(middleware);

    // Get the address to bind to
    let addr = std::env::var("BIND_ADDR")
        .unwrap_or_else(|_| "127.0.0.1:3000".to_string())
        .parse::<SocketAddr>()?;

    // Create a TCP listener
    let listener = TcpListener::bind(addr).await?;
    tracing::info!("Starting server on {}", addr);

    // Start the server with the new axum::serve approach
    axum::serve(listener, app).await?;

    Ok(())
}
