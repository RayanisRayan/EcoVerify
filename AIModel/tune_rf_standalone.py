# tune_rf_standalone.py
import argparse
import os
import joblib
import numpy as np
import pandas as pd
from scipy.stats import randint
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    mean_absolute_error,
    mean_absolute_percentage_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import RandomizedSearchCV, train_test_split
from sklearn.preprocessing import StandardScaler

# --- Configuration via Command-Line Arguments ---
parser = argparse.ArgumentParser(
    description="Tune RandomForestRegressor using RandomizedSearchCV (Standalone)."
)
parser.add_argument(
    "--data-path",
    type=str,
    required=True,
    help="Path to the input CSV data file.",
)
parser.add_argument(
    "--target-column",
    type=str,
    required=True,
    help="Name of the target variable column (e.g., 'CO', 'NOX').",
)
# Optional: Load a pre-existing scaler if you ran the previous script
parser.add_argument(
    "--scaler-path",
    type=str,
    default=None,
    help=(
        "Optional path to a pre-saved StandardScaler object (.joblib). "
        "If not provided, a new scaler will be fitted on the training data."
    ),
)
parser.add_argument(
    "--test-size",
    type=float,
    default=0.2,
    help="Fraction of data to use for the test set.",
)
parser.add_argument(
    "--random-state",
    type=int,
    default=42,
    help="Random state seed for reproducibility (use same as original split if possible).",
)
parser.add_argument(
    "--n-iter",
    type=int,
    default=50,
    help="Number of parameter settings sampled by RandomizedSearchCV.",
)
parser.add_argument(
    "--cv-folds",
    type=int,
    default=3,
    help="Number of cross-validation folds.",
)
parser.add_argument(
    "--accuracy-goal",
    type=float,
    default=0.75,
    help="Target 'accuracy' (used to derive MAPE threshold).",
)

args = parser.parse_args()

# --- Constants ---
OUTPUT_DIR = "models"
TUNED_MODEL_FILENAME = f"{OUTPUT_DIR}/tuned_standalone_RandomForest_{args.target_column}.joblib"
# Scaler filename only relevant if we fit a new one
NEW_SCALER_FILENAME = f"{OUTPUT_DIR}/scaler_standalone_{args.target_column}.joblib"


# --- Main Tuning Logic ---
def main():
    """Loads data, preprocesses, tunes RF, evaluates, and saves."""

    # Create output directory
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created output directory: {OUTPUT_DIR}")

    # 1. Load Data
    print(f"Loading data from: {args.data_path}")
    try:
        data = pd.read_csv(args.data_path)
    except FileNotFoundError:
        print(f"Error: Data file not found at {args.data_path}")
        return
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    if args.target_column not in data.columns:
        print(
            f"Error: Target column '{args.target_column}' not found in the data."
        )
        return

    if (data[args.target_column] == 0).any():
        print(
            f"Warning: Target column '{args.target_column}' contains zero values."
            " MAPE results might be misleading or infinite."
        )
    print(f"Data loaded with shape: {data.shape}")

    # 2. Prepare Data (Split)
    print("Splitting data...")
    try:
        X = data.drop(columns=[args.target_column])
        y = data[args.target_column]
        # Use the random_state for consistent splitting if desired
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=args.test_size,
            random_state=args.random_state,
        )
        print(f"Training data size: {X_train.shape}")
        print(f"Testing data size: {X_test.shape}")
    except Exception as e:
        print(f"Error during data splitting: {e}")
        return

    # 3. Scale Features
    scaler = None
    if args.scaler_path and os.path.exists(args.scaler_path):
        try:
            print(f"Loading pre-existing scaler from: {args.scaler_path}")
            scaler = joblib.load(args.scaler_path)
            X_train_scaled = scaler.transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            print("Features scaled using loaded scaler.")
        except Exception as e:
            print(f"Error loading scaler from {args.scaler_path}: {e}")
            print("Will fit a new scaler instead.")
            scaler = None # Reset scaler flag
    
    if scaler is None: # If no scaler path provided or loading failed
        print("Fitting a new StandardScaler on training data...")
        scaler = StandardScaler()
        try:
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            # Save the newly fitted scaler
            joblib.dump(scaler, NEW_SCALER_FILENAME)
            print(f"New scaler saved to {NEW_SCALER_FILENAME}")
        except Exception as e:
            print(f"Error during feature scaling: {e}")
            return

    # 4. Define Hyperparameter Search Space for RandomForest
    param_dist = {
        "n_estimators": randint(100, 400),
        "max_depth": [10, 15, 20, 25, 30, None],
        "min_samples_split": randint(2, 15),
        "min_samples_leaf": randint(1, 10),
        "max_features": ["sqrt", "log2", 0.5, 0.7],
        "criterion": ["squared_error", "absolute_error"],
    }

    # 5. Setup and Run Randomized Search
    print("\n--- Starting Hyperparameter Tuning for RandomForestRegressor ---")
    # We are tuning a RandomForest, so initialize the base estimator here
    base_rf = RandomForestRegressor(random_state=args.random_state)

    try:
        random_search = RandomizedSearchCV(
            estimator=base_rf,
            param_distributions=param_dist,
            n_iter=args.n_iter,
            cv=args.cv_folds,
            scoring="neg_mean_absolute_percentage_error", # Optimize for MAPE
            n_jobs=-1,
            random_state=args.random_state,
            verbose=1,
        )

        print(f"Running Randomized Search (n_iter={args.n_iter}, cv={args.cv_folds})...")
        # Fit the search on the scaled training data
        random_search.fit(X_train_scaled, y_train)

    except TypeError as e:
        print(f"Error during RandomizedSearchCV setup or fitting: {e}")
        print("This might be due to library version incompatibility.")
        print("Try updating scikit-learn and scipy: pip install --upgrade scikit-learn scipy")
        return
    except Exception as e:
        print(f"An unexpected error occurred during tuning: {e}")
        return

    print("\n--- Tuning Complete ---")
    print(f"Best parameters found: {random_search.best_params_}")
    print(f"Best CV MAPE score: {-random_search.best_score_:.4f}") # Negate score

    # 6. Evaluate Best Model on Test Set
    print("\n--- Evaluating Best Tuned Model on Test Set ---")
    best_rf_model = random_search.best_estimator_
    y_pred_tuned = best_rf_model.predict(X_test_scaled)

    # Calculate final metrics
    tuned_rmse = np.sqrt(mean_squared_error(y_test, y_pred_tuned))
    tuned_r2 = r2_score(y_test, y_pred_tuned)
    tuned_mae = mean_absolute_error(y_test, y_pred_tuned)
    tuned_mape = mean_absolute_percentage_error(y_test, y_pred_tuned)

    print(f"RMSE: {tuned_rmse:.4f}")
    print(f"MAE: {tuned_mae:.4f}")
    print(f"R²: {tuned_r2:.4f}")
    print(f"MAPE: {tuned_mape:.4f} ({tuned_mape * 100:.2f}%)")

    # 7. Check Accuracy Goal
    allowed_mape = 1.0 - args.accuracy_goal
    print("\n--- Accuracy Goal Check ---")
    if tuned_mape <= allowed_mape:
        print(
            f"[SUCCESS] Model MAPE ({tuned_mape*100:.2f}%) is within the allowed {allowed_mape*100:.0f}% error threshold for {args.accuracy_goal*100:.0f}% accuracy."
        )
    else:
        print(
            f"[FAILED] Model MAPE ({tuned_mape*100:.2f}%) exceeds the allowed {allowed_mape*100:.0f}% error threshold for {args.accuracy_goal*100:.0f}% accuracy."
        )

    # 8. Save Tuned Model
    try:
        joblib.dump(best_rf_model, TUNED_MODEL_FILENAME)
        print(f"\nTuned RandomForest model saved to {TUNED_MODEL_FILENAME}")
    except Exception as e:
        print(f"Error saving tuned model: {e}")

    print("\n--- Standalone Tuning Script Finished ---")


if __name__ == "__main__":
    main()
