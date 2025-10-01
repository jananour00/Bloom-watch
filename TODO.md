# TODO: Fix KeyboardInterrupt in model_train.py and related scripts

## Steps:
1. [x] Update backend/utils.py: Add retry mechanism to fetch_power_point function using requests.adapters.HTTPAdapter and urllib3.util.retry.Retry. Increase timeout to 60 seconds.
2. [x] Update backend/model_train.py: Change exception handling from `except Exception as e` to `except BaseException as e` to catch KeyboardInterrupt.
3. [x] Update backend/bloom_detection.py: Change exception handling to catch BaseException.
4. [x] Update backend/desertification_model.py: Change exception handling to catch BaseException.
5. [x] Update backend/forecasting_model.py: Change exception handling to catch BaseException.
6. [x] Update backend/dash_app.py: Add try-except around fetch_power_point call to handle exceptions gracefully.
7. [x] Test the changes by running python backend/model_train.py. (User denied execution, but changes are ready for testing.)
