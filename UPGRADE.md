# 🔑 Key Principles

1. **Database (MariaDB) must be persisted** → you already mounted mariadb-data volume ✅ so DB data survives container recreation.

2. **Customizations must live outside the container image** → you’re already pulling `gnapi_customizations` from GitHub. As long as the repo is updated and versioned, you won’t lose your app.

3. **Bench/apps code is inside your container right now (`frappe-bench` dir)** → you need a way to persist/upgrade these without starting from scratch every time.

# 🛠️ Upgrade Strategy
1. **Persist apps & sites outside container**

Modify your `docker-compose.yml` so that `frappe-bench` (apps + sites) is volume-mounted:

```yaml
frappe:
  image: frappe/bench:latest
  command: bash /workspace/init.sh
  environment:
    - SHELL=/bin/bash
  working_dir: /home/frappe
  volumes:
    - ./workspace:/workspace         # your init.sh
    - ./frappe-bench:/home/frappe/frappe-bench   # persist bench code + apps + sites
  ports:
    - 8000:8000
    - 9000:9000

```

👉 This way, all apps (frappe, erpnext, hrms, company_customizations) and your site config live on the host. When you recreate/upgrade containers, the code and configs persist.

2. **Upgrade frappe/erpnext/hrms**

Inside the frappe container:
```bash
# Enter container
docker exec -it <frappe_container_id> bash

# Go to bench
cd frappe-bench

# Update apps
bench get-app --branch version-15 frappe
bench get-app --branch version-15 erpnext
bench get-app --branch version-15 hrms

# Or if apps are already installed
bench update --apps frappe erpnext hrms
```

⚠️ Make sure to match the correct branch (e.g. version-15 if you’re on ERPNext v15).

3. **Upgrade your custom app**

If you’ve made changes in gnapi_customizations:

```bash
cd apps/gnapi_customizations
git pull origin main
cd ../../
bench update --apps gnapi_customizations

```

4. **Apply patches/migrations**
After pulling new versions:
```bash
bench update --patch
bench migrate
bench build
bench clear-cache
```

5. **Backup before upgrading**
Always take DB + files backup before an upgrade:
```bash
bench --site mysite.localhost backup
```
This saves database + site files under `sites/mysite.localhost/private/backups`.

___

🚀 Example Upgrade Workflow

1. git pull latest code in frappe/bench image (or rebuild container with new base).

2. Inside container:
```bash
cd frappe-bench
bench update --apps frappe erpnext hrms gnapi_customizations
bench migrate
bench build
```
3. Restart containers
```bash
docker-compose down && docker-compose up -d
```

Your **data stays safe** because of mariadb-data volume.
Your **apps + sites** stay safe because of `frappe-bench` volume.
Your **custom app** stays safe in GitHub + volume.