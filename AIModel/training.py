# training of the AI model SHALL happen here
# we follow an apprach based on two main things, hyper optimisation, and the round battle nature of
# the genetic algorithm, this is a heavily intensive training model
# however it should lead to optimal results
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.neural_network import MLPRegressor
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
from tqdm import tqdm
import joblib
import os

class TournamentModelSelection:
    def __init__(
        self,
        data_path,
        target_column="co2_output",
        test_size=0.2,
        random_state=42,
        tournament_data_fraction=0.3,
        tournament_rounds=3,
        metrics=["rmse", "r2"],
        primary_metric="rmse",
    ):
        self.data_path = data_path
        self.target_column = target_column
        self.test_size = test_size
        self.random_state = random_state
        self.tournament_data_fraction = tournament_data_fraction
        self.tournament_rounds = tournament_rounds
        self.metrics = metrics
        self.primary_metric = primary_metric
        self.model_history = {}
        self.round_winners = []
        
        # Create output directory for models
        if not os.path.exists("models"):
            os.makedirs("models")
            
        # Load and prepare data
        self._load_data()
        self._prepare_data()
        self._define_models()
        
    def _load_data(self):
        """Load the dataset from CSV file, using the first column as index"""
        print("Loading data...")
        # Use index_col=0 to treat the first column as the index
        self.data = pd.read_csv(self.data_path, index_col=0)
        print(f"Data loaded with shape: {self.data.shape}")
        # Optional: Check if 'Unnamed: 0' is still somehow present and drop it
        if "Unnamed: 0" in self.data.columns:
             print("Warning: 'Unnamed: 0' column found even with index_col=0. Dropping it.")
             self.data = self.data.drop(columns=["Unnamed: 0"])
        if "timestamp" in self.data.columns:
             print("Warning: 'Unnamed: 0' column found even with index_col=0. Dropping it.")
             self.data = self.data.drop(columns=["timestamp"])
        if "tvoc" in self.data.columns:
             print("Warning: 'Unnamed: 0' column found even with index_col=0. Dropping it.")
             self.data = self.data.drop(columns=["tvoc"])
         
    def _prepare_data(self):
        """Split data and scale features"""
        print("Preparing data...")
        X = self.data.drop(columns=[self.target_column])
        y = self.data[self.target_column]
        
        # Split data into train and test sets
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=self.test_size, random_state=self.random_state
        )
        
        # Scale features
        self.scaler = StandardScaler()
        self.X_train_scaled = self.scaler.fit_transform(self.X_train)
        self.X_test_scaled = self.scaler.transform(self.X_test)
        
        print(f"Training data size: {self.X_train.shape}")
        print(f"Testing data size: {self.X_test.shape}")
        
    def _define_models(self):
        """Define a variety of models with different hyperparameters"""
        self.models = {
            "LinearRegression": LinearRegression(),
            "Ridge_alpha0.1": Ridge(alpha=0.1),
            "Ridge_alpha1.0": Ridge(alpha=1.0),
            "Lasso_alpha0.1": Lasso(alpha=0.1),
            "Lasso_alpha0.01": Lasso(alpha=0.01),
            "ElasticNet_0.5_0.5": ElasticNet(alpha=0.5, l1_ratio=0.5),
            "KNN_5": KNeighborsRegressor(n_neighbors=5),
            "KNN_10": KNeighborsRegressor(n_neighbors=10),
            "SVR_rbf": SVR(kernel="rbf", C=1.0, gamma="scale"),
            "SVR_linear": SVR(kernel="linear", C=1.0),
            "RandomForest_50": RandomForestRegressor(
                n_estimators=50, random_state=self.random_state
            ),
            "RandomForest_100": RandomForestRegressor(
                n_estimators=100, random_state=self.random_state
            ),
            "GradientBoosting_50": GradientBoostingRegressor(
                n_estimators=50, random_state=self.random_state
            ),
            "GradientBoosting_100": GradientBoostingRegressor(
                n_estimators=100, random_state=self.random_state
            ),
            "XGBoost_50": xgb.XGBRegressor(
                n_estimators=50, random_state=self.random_state
            ),
            "XGBoost_100": xgb.XGBRegressor(
                n_estimators=100, random_state=self.random_state
            ),
            "MLP_1layer": MLPRegressor(
                hidden_layer_sizes=(100,),
                max_iter=500,
                random_state=self.random_state,
            ),
            "MLP_2layers": MLPRegressor(
                hidden_layer_sizes=(100, 50),
                max_iter=500,
                random_state=self.random_state,
            ),
        }
        
        print(f"Defined {len(self.models)} different models for tournament")
        
    def _tournament_round(self, models, round_num):
        """Run a tournament round with the given models"""
        print(f"\n--- Tournament Round {round_num} ---")
        print(f"Competing models: {len(models)}")
        
        # Subsample the training data for quicker evaluation
        tournament_size = int(len(self.X_train) * self.tournament_data_fraction)
        indices = np.random.choice(
            len(self.X_train), tournament_size, replace=False
        )
        X_tournament = self.X_train_scaled[indices]
        y_tournament = self.y_train.iloc[indices]
        
        # Track model performance
        results = {}
        
        # Train and evaluate each model
        for name, model in tqdm(models.items()):
            try:
                # Perform cross-validation
                cv_rmse = -np.mean(
                    cross_val_score(
                        model,
                        X_tournament,
                        y_tournament,
                        cv=3,
                        scoring="neg_root_mean_squared_error",
                    )
                )
                cv_r2 = np.mean(
                    cross_val_score(
                        model, X_tournament, y_tournament, cv=3, scoring="r2"
                    )
                )
                
                # Train on the tournament data
                model.fit(X_tournament, y_tournament)
                
                # Record results
                results[name] = {
                    "model": model,
                    "rmse": cv_rmse,
                    "r2": cv_r2,
                }
                
                # Optionally save model for analysis
                joblib.dump(
                    model, f"models/round{round_num}_{name}.joblib"
                )
                
            except Exception as e:
                print(f"Error with model {name}: {e}")
                continue
        
        # Sort models by primary metric
        if self.primary_metric == "rmse":
            sorted_models = sorted(
                results.items(), key=lambda x: x[1]["rmse"]
            )  # Lower RMSE is better
        else:
            sorted_models = sorted(
                results.items(), key=lambda x: -x[1]["r2"]
            )  # Higher R² is better
            
        # Save round results
        self.model_history[f"round_{round_num}"] = results
        
        # Return the top half of models
        top_half = int(np.ceil(len(sorted_models) / 2))
        winners = {name: results_dict["model"] for name, results_dict in sorted_models[:top_half]}
        
        # Record the best model of this round
        best_model_name = sorted_models[0][0]
        self.round_winners.append(best_model_name)
        
        print(f"Round {round_num} best model: {best_model_name}")
        print(f"RMSE: {results[best_model_name]['rmse']:.4f}, R²: {results[best_model_name]['r2']:.4f}")
        
        return winners
    
    def run_tournament(self):
        """Run the model tournament to find the best model"""
        print("Starting model tournament...")
        
        competing_models = self.models
        for round_num in range(1, self.tournament_rounds + 1):
            competing_models = self._tournament_round(competing_models, round_num)
            
            # If only one model left or no models left, stop early
            if len(competing_models) <= 1:
                break
                
        # Get the final winner
        if len(competing_models) == 1:
            self.winner_name = list(competing_models.keys())[0]
            self.winner_model = list(competing_models.values())[0]
        else:
            # This should not happen normally but just in case
            self.winner_name = self.round_winners[-1]
            self.winner_model = self.model_history[f"round_{self.tournament_rounds}"][self.winner_name]["model"]
            
        print(f"\nTournament completed! Winner: {self.winner_name}")
        return self.winner_name, self.winner_model
    
    def train_final_model(self):
        """Train the winning model on the full training dataset"""
        print(f"\nTraining final {self.winner_name} model on full dataset...")
        
        # Clone the winning model if needed (to ensure fresh training)
        self.final_model = joblib.load(f"models/round{self.tournament_rounds}_{self.winner_name}.joblib")
        
        # Train on full training set
        self.final_model.fit(self.X_train_scaled, self.y_train)
        
        # Evaluate on test set
        y_pred = self.final_model.predict(self.X_test_scaled)
        test_rmse = np.sqrt(mean_squared_error(self.y_test, y_pred))
        test_r2 = r2_score(self.y_test, y_pred)
        
        print("Final model performance on test set:")
        print(f"RMSE: {test_rmse:.4f}")
        print(f"R²: {test_r2:.4f}")
        
        # Save the final model
        joblib.dump(self.final_model, "models/final_model.joblib")
        
        # Save the scaler for preprocessing new data
        joblib.dump(self.scaler, "models/scaler.joblib")
        
        return self.final_model, test_rmse, test_r2
    
    def visualize_results(self):
        """Visualize tournament results"""
        plt.figure(figsize=(14, 8))
        
        # Plot RMSE across rounds for each model that made it to the final round
        sns.set_style("whitegrid")
        
        # Extract metrics for plotting
        round_results = []
        for round_num in range(1, self.tournament_rounds + 1):
            if f"round_{round_num}" in self.model_history:
                round_data = self.model_history[f"round_{round_num}"]
                for model_name, metrics in round_data.items():
                    round_results.append({
                        "Round": round_num,
                        "Model": model_name,
                        "RMSE": metrics["rmse"],
                        "R²": metrics["r2"]
                    })
        
        results_df = pd.DataFrame(round_results)
        
        # Plot RMSE
        plt.subplot(1, 2, 1)
        sns.lineplot(data=results_df, x="Round", y="RMSE", hue="Model")
        plt.title("RMSE Across Tournament Rounds")
        plt.ylabel("RMSE (lower is better)")
        
        # Plot R²
        plt.subplot(1, 2, 2)
        sns.lineplot(data=results_df, x="Round", y="R²", hue="Model")
        plt.title("R² Across Tournament Rounds")
        plt.ylabel("R² (higher is better)")
        
        plt.tight_layout()
        plt.savefig("tournament_results.png")
        plt.show()
        
        # Highlight the winner
        print(f"Tournament winners by round:")
        for i, winner in enumerate(self.round_winners):
            print(f"Round {i+1}: {winner}")


# Usage example
if __name__ == "__main__":
    tournament = TournamentModelSelection(
        data_path="sensor_data_log.csv",  # Replace with your dataset
        target_column="co2",
        tournament_rounds=3,
        tournament_data_fraction=0.3,
        primary_metric="rmse"
    )
    
    # Run the tournament to find the best model
    winner_name, winner_model = tournament.run_tournament()
    
    # Train the winning model on the full dataset
    final_model, test_rmse, test_r2 = tournament.train_final_model()
    
    # Visualize results
    tournament.visualize_results()

