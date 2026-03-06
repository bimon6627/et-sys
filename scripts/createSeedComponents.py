import psycopg2
import json

# 1. UPDATE YOUR DB CREDENTIALS HERE
DB_CONFIG = {
    "dbname": "dev_conference_db",
    "user": "dev",      # e.g., 'dev' or 'postgres'
    "password": "dev",
    "host": "100.94.174.17",
    "port": "5432"
}

OUTPUT_FILE = "seed_output.ts"

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def fetch_permissions(cur, f):
    f.write("// --- 1. PERMISSIONS ---\n")
    try:
        cur.execute('SELECT slug, description, "isSystemPermission" FROM "Permission"')
        rows = cur.fetchall()
        
        f.write("const permissions = [\n")
        for row in rows:
            slug, desc, is_sys = row
            desc = f'"{desc}"' if desc else "null"
            is_sys = "true" if is_sys else "false"
            f.write(f'  {{ slug: "{slug}", description: {desc}, isSystemPermission: {is_sys} }},\n')
        f.write("];\n\n")
    except Exception as e:
        f.write(f"// Error fetching permissions: {e}\n")
        f.write("const permissions = [];\n\n")

def fetch_roles(cur, f):
    f.write("// --- 2. ROLES ---\n")
    try:
        query = """
            SELECT r.name, r.description, array_agg(p.slug)
            FROM "Role" r
            LEFT JOIN "_PermissionToRole" pr ON r.id = pr."B"
            LEFT JOIN "Permission" p ON pr."A" = p.id
            GROUP BY r.id;
        """
        cur.execute(query)
        rows = cur.fetchall()

        f.write("const roles = [\n")
        for row in rows:
            name, desc, slugs = row
            desc = f'"{desc}"' if desc else "null"
            slugs = [s for s in slugs if s] if slugs else []
            slugs_json = json.dumps(slugs)
            f.write(f'  {{ name: "{name}", description: {desc}, permissions: {slugs_json} }},\n')
        f.write("];\n\n")
    except Exception as e:
        f.write(f"// Error fetching roles: {e}\n")
        f.write("const roles = [];\n\n")

def fetch_regions(cur, f):
    f.write("// --- 3. REGIONS ---\n")
    try:
        query = """
            SELECT r.name, r.global, r.internal, parent.name as parent_name
            FROM "Region" r
            LEFT JOIN "Region" parent ON r."parentId" = parent.id;
        """
        cur.execute(query)
        rows = cur.fetchall()

        f.write("const regions = [\n")
        for row in rows:
            name, is_global, internal, parent_name = row
            is_global = "true" if is_global else "false"
            internal = "true" if internal else "false"
            parent_str = f'"{parent_name}"' if parent_name else "null"
            f.write(f'  {{ name: "{name}", global: {is_global}, internal: {internal}, parent: {parent_str} }},\n')
        f.write("];\n\n")
    except Exception as e:
        f.write(f"// Error fetching regions: {e}\n")
        f.write("const regions = [];\n\n")

def fetch_organizations(cur, f):
    f.write("// --- 4. ORGANIZATIONS ---\n")
    try:
        query = """
            SELECT o.name, o."canVote", r.name
            FROM "Organization" o
            LEFT JOIN "Region" r ON o."regionId" = r.id;
        """
        cur.execute(query)
        rows = cur.fetchall()

        f.write("const organizations = [\n")
        for row in rows:
            name, can_vote, region_name = row
            can_vote_str = "true" if can_vote else "false"
            region_str = f'"{region_name}"' if region_name else "null"
            
            # Escape quotes in names just in case
            name_escaped = name.replace('"', '\\"')
            
            f.write(f'  {{ name: "{name_escaped}", canVote: {can_vote_str}, region: {region_str} }},\n')
        f.write("];\n\n")
    except Exception as e:
        f.write(f"// Error fetching organizations: {e}\n")
        f.write("const organizations = [];\n\n")

def fetch_whitelist(cur, f):
    f.write("// --- 5. WHITELIST USERS ---\n")
    try:
        query = """
            SELECT w.email, r.name, reg.name
            FROM "Whitelist" w
            LEFT JOIN "Role" r ON w."roleId" = r.id
            LEFT JOIN "Region" reg ON w."regionId" = reg.id;
        """
        cur.execute(query)
        rows = cur.fetchall()

        f.write("const users = [\n")
        for row in rows:
            email, role_name, region_name = row
            role_str = f'"{role_name}"' if role_name else "null"
            region_str = f'"{region_name}"' if region_name else "null"
            f.write(f'  {{ email: "{email}", name: null, role: {role_str}, region: {region_str} }},\n')
        f.write("];\n\n")
    except Exception as e:
        f.write(f"// Error fetching whitelist: {e}\n")
        f.write("const users = [];\n\n")

def generate_seeder():
    conn = get_connection()
    cur = conn.cursor()

    print(f"Generating {OUTPUT_FILE}...")
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write('import { PrismaClient } from "@prisma/client";\n')
        f.write('const prisma = new PrismaClient();\n\n')
        f.write('async function main() {\n')

        try:
            # 1. Fetch Data
            fetch_permissions(cur, f)
            fetch_roles(cur, f)
            fetch_regions(cur, f)
            fetch_organizations(cur, f)
            fetch_whitelist(cur, f)

            # 2. Generate JS Logic
            f.write("""
  // --- SEED LOGIC ---
  
  // 1. Permissions
  console.log('Seeding Permissions...');
  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: { isSystemPermission: p.isSystemPermission },
      create: p,
    });
  }

  // 2. Roles
  console.log('Seeding Roles...');
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {
        permissions: {
          set: [], // Clear old
          connect: r.permissions.map((slug) => ({ slug })),
        },
      },
      create: {
        name: r.name,
        description: r.description,
        permissions: {
          connect: r.permissions.map((slug) => ({ slug })),
        },
      },
    });
  }

  // 3. Regions
  console.log('Seeding Regions...');
  for (const r of regions) {
    await prisma.region.upsert({
      where: { name: r.name },
      update: {},
      create: {
        name: r.name,
        global: r.global,
        internal: r.internal,
      },
    });
  }
  // Link parents in second pass
  for (const r of regions) {
    if (r.parent) {
      await prisma.region.update({
        where: { name: r.name },
        data: {
          parent: { connect: { name: r.parent } }
        }
      });
    }
  }

  // 4. Organizations
  console.log('Seeding Organizations...');
  for (const o of organizations) {
    if (!o.region) {
        console.warn(`Skipping org ${o.name} because it has no region.`);
        continue;
    }
    await prisma.organization.upsert({
        where: { name: o.name },
        update: { canVote: o.canVote },
        create: {
            name: o.name,
            canVote: o.canVote,
            region: { connect: { name: o.region } }
        }
    });
  }

  // 5. Users
  console.log('Seeding Users...');
  for (const u of users) {
    await prisma.whitelist.upsert({
      where: { email: u.email },
      update: { name: u.name }, 
      create: {
        email: u.email,
        name: u.name,
        role: u.role ? { connect: { name: u.role } } : undefined,
        region: u.region ? { connect: { name: u.region } } : undefined,
      },
    });
  }
""")

        except Exception as e:
            f.write(f"\n// Error generating seed: {e}\n")
        finally:
            f.write("}\n\n")
            f.write("main()\n")
            f.write("  .catch((e) => { console.error(e); process.exit(1); })\n")
            f.write("  .finally(async () => { await prisma.$disconnect(); });\n")
            cur.close()
            conn.close()

    print("Done! File saved.")

if __name__ == "__main__":
    generate_seeder()