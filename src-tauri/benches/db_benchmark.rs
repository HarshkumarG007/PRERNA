use criterion::{criterion_group, criterion_main, Criterion};
use rusqlite::Connection;
use app_lib::db::{Database, models::{AssessmentSession, NewUser}};

// PRERNA System Benchmarks (P5-4)
// Measures AES-256 local encryption latency and SQLite insertion performance

fn setup_benchmark_db() -> Database {
    let conn = Connection::open_in_memory().unwrap();
    conn.execute_batch(app_lib::db::schema::SCHEMA_SQL).unwrap();
    Database { conn }
}

fn bench_session_save(c: &mut Criterion) {
    let db = setup_benchmark_db();
    let user = NewUser {
        age_range: "13-15".to_string(),
        region: "Delhi".to_string(),
        language: "en".to_string(),
    };
    
    let user_id = db.create_user(&user).unwrap_or_else(|_| "test_user".to_string());
    
    c.bench_function("save_session_encrypted", |b| {
        b.iter(|| {
            let session = AssessmentSession {
                id: String::new(),
                user_id: user_id.clone(),
                session_type: "life_quest".to_string(),
                started_at: "2023-01-01T00:00:00Z".to_string(),
                completed_at: Some("2023-01-01T00:05:00Z".to_string()),
                raw_choices: r#"{"q1":"a","q2":"b","q3":"c","q4":"d"}"#.to_string(),
                derived_traits: r#"{"openness": 80, "conscientiousness": 60}"#.to_string(),
                disclosure_version: "v1.0".to_string(),
                disclosure_shown_at: 1620000000,
            };
            // Note: In benchmark mode, this tests the SQLite insertion speed.
            // Since `keyring` requires OS prompt on some systems, it might mock encryption,
            // but the serialization and insert latency is fully measured.
            db.save_session(&session)
        })
    });
}

criterion_group!(benches, bench_session_save);
criterion_main!(benches);
