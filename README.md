# Instructions to follow
Create a new directory where you want to install the application.

### Installation
```bash
git clone https://github.com/vamsikrishna-gnapitech/gnapi_customizations.git
cd gnapi_customizations/docker
docker-compose up
```
Wait for some time until the setup script creates a site. After that you can access http://localhost:8000 in your browser and the login screen should show up.

Use the following credentials to log in:
- Username: Administrator
- Password: admin

On successful login, you can set the company details and first user if prompted. 

**Note: If you didn’t see the company setup screen during the initial setup, it means the setup is corrupted. To fix this, you’ll need to uninstall and remove the container, then delete all related folders before reinstalling.**

### License
MIT

# Ignore the below instructions
### ~~Gnapi Customizations~~

~~Gnapi Customizations~~

### ~~Installation~~

~~You can install this app using the [bench](https://github.com/frappe/bench) CLI:~~

```bash
cd /home/frappe/frappe-bench
bench get-app https://github.com/vamsikrishna-gnapitech/gnapi_customizations.git --branch main 
### If the above repository is not found, it will be located at https://github.com/gnapi-tech/gnapi_customizations.git
bench install-app gnapi_customizations
```

### ~~Contributing~~

~~This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:~~

```bash
cd apps/gnapi_customizations
pre-commit install
```

~~Pre-commit is configured to use the following tools for checking and formatting your code:~~

- ~~ruff~~
- ~~eslint~~
- ~~prettier~~
- ~~pyupgrade~~

### ~~License~~

~~mit~~
