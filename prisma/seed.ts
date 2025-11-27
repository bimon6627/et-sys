const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Seeding...");

  // 1. Seed Permissions
  const permissionsList = [
    { slug: "case:read", description: "Can view cases" },
    { slug: "case:write", description: "Can edit/approve cases" },
    { slug: "case:delete", description: "Can delete cases" },
    { slug: "admin:view", description: "Can view admin dashboard" },
    { slug: "users:write", description: "Can create new users" },
    { slug: "users:read", description: "Can view users" },
    { slug: "users:delete", description: "Can delete users" },
    { slug: "hse:write", description: "Can create and modify hse incidents" },
    { slug: "hse:read", description: "Can view hse incidents" },
    { slug: "hse:delete", description: "Can delete hse incidents" },
    {
      slug: "participant:write",
      description: "Can create and modify participants",
    },
    { slug: "participant:read", description: "Can view participants" },
    { slug: "participant:delete", description: "can delete participants" },
    {
      slug: "participant:regional_read",
      description: "Can view participants in the same region",
    },
  ];

  for (const p of permissionsList) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  const ROLES_DATA = [
    { name: "ADMIN", permissions: ["ALL"] }, // Simplified ADMIN permission for clarity
    {
      name: "KONKOM",
      permissions: [
        "case:read",
        "case:write",
        "case:delete",
        "participant:read",
        "participant:write",
        "participant:delete",
      ],
    },
    {
      name: "SEK",
      permissions: [
        "participant:read",
        "participant:write",
        "participant:delete",
        "hse:read",
        "hse:write",
      ],
    },
    {
      name: "SEK_LEDELSE",
      permissions: [
        "participant:read",
        "participant:write",
        "participant:delete",
        "hse:read",
        "hse:write",
        "hse:delete",
      ],
    },
  ];

  // 2. Seed Roles

  const allPermissions = await prisma.permission.findMany();
  // Map slugs to their IDs for quick connection lookups
  const permissionSlugMap = new Map(
    allPermissions.map((p: { slug: any; id: any }) => [p.slug, p.id])
  );

  // 3. Seed Roles using the ROLES_DATA array
  console.log("...Seeding Roller");

  for (const roleData of ROLES_DATA) {
    let permissionsToConnect: { id: number }[] = [];

    // Determine permissions based on the role name/data
    if (roleData.name === "ADMIN") {
      // ADMIN gets ALL permissions fetched from the database
      permissionsToConnect = allPermissions.map((p: any) => ({ id: p.id }));
    } else {
      // Other roles use the slug strings defined in the array
      const requiredSlugs = roleData.permissions as string[];

      permissionsToConnect = requiredSlugs
        .map((slug) => {
          const id = permissionSlugMap.get(slug);
          if (id === undefined) {
            console.warn(
              `[WARN] Permission slug '${slug}' not found for role ${roleData.name}. Skipping.`
            );
            return null;
          }
          return { id: id };
        })
        .filter((p) => p !== null) as { id: number }[];
    }

    // Upsert the role and connect permissions
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        // Set: [] first clears existing relations, ensuring the final state matches ROLES_DATA
        permissions: { set: [], connect: permissionsToConnect },
        description: roleData.name, // Optional: Set a description if needed
      },
      create: {
        name: roleData.name,
        description: roleData.name,
        permissions: { connect: permissionsToConnect },
      },
    });
  }

  // 3. Seed Regions (REQUIRED for Participants)
  console.log("...Seeding Regions");
  const regionsData = [
    "Agder",
    "Innlandet",
    "Møre og Romsdal",
    "Nordland",
    "Oslo",
    "Rogaland",
    "Troms",
    "Telemark",
    "Finnmark",
    "Trøndelag",
    "Vestfold",
    "Vestland",
    "Akershus",
    "Buskerud",
    "Østfold",
    "Elevorganisasjonen",
    "Individuelt Medlemsskap",
  ];

  // We store the created regions to link organizations later
  const regionNameMap = new Map<string, number>();

  for (const name of regionsData) {
    const region = await prisma.region.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    regionNameMap.set(region.name, region.id); // Lagrer ID for oppslag
  }

  const ORGANIZATIONS_DATA = [
    // Format: { name: "Organization Name", region_name: "Matching Region Name", can_vote: boolean }
    {
      name: "Arendal videregående skole",
      region_name: "Agder",
      can_vote: true,
    },
    {
      name: "Dahlske videregående skole",
      region_name: "Agder",
      can_vote: true,
    },
    {
      name: "Eilert Sundt videregående skole, avd Farsund",
      region_name: "Agder",
      can_vote: true,
    },
    {
      name: "Eilert Sundt videregående skole, avd Lyngdal",
      region_name: "Agder",
      can_vote: true,
    },
    {
      name: "Flekkefjord videregående skole avd Flekkefjord",
      region_name: "Agder",
      can_vote: true,
    },
    { name: "Grim skole", region_name: "Agder", can_vote: true },
    {
      name: "Kristiansand katedralskole Gimle",
      region_name: "Agder",
      can_vote: true,
    },
    {
      name: "Kvadraturen videregående skole",
      region_name: "Agder",
      can_vote: true,
    },
    {
      name: "Lillesand Videregående Skole",
      region_name: "Agder",
      can_vote: true,
    },
    { name: "Mandal Videregående Skole", region_name: "Agder", can_vote: true },
    { name: "Risør Videregående Skole", region_name: "Agder", can_vote: true },
    {
      name: "Sam Eyde Videregående Skole",
      region_name: "Agder",
      can_vote: true,
    },
    {
      name: "Setesdal Videregående Skole avd Valle, Hovden og Hornes",
      region_name: "Agder",
      can_vote: true,
    },
    { name: "Songdalen Ungdomsskole", region_name: "Agder", can_vote: true },
    {
      name: "Steinerskolen i Kristiansand",
      region_name: "Agder",
      can_vote: true,
    },
    { name: "Søgne videregående skole", region_name: "Agder", can_vote: true },
    { name: "Tangen videregående skole", region_name: "Agder", can_vote: true },
    { name: "Torridal ungdomsskole", region_name: "Agder", can_vote: true },
    {
      name: "Tvedestrand videregående skole",
      region_name: "Agder",
      can_vote: true,
    },
    { name: "Valle Skule", region_name: "Agder", can_vote: true },
    {
      name: "Vennesla videregående skole",
      region_name: "Agder",
      can_vote: true,
    },
    {
      name: "Vågsbygd videregående skole",
      region_name: "Agder",
      can_vote: true,
    },

    {
      name: "Akademiet Realfagsgymnas Sandvika",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Alværn ungdomsskole", region_name: "Akershus", can_vote: true },
    {
      name: "Asker videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Aursmoen skole", region_name: "Akershus", can_vote: true },
    {
      name: "Bakkeløkka ungdomsskole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Bjørkelangen videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Bleiker videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Drømtorp videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Dyrløkkeåsen skole", region_name: "Akershus", can_vote: true },
    {
      name: "Dønski videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Eidsvoll videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Fløysbonn skole", region_name: "Akershus", can_vote: true },
    { name: "Gjettum skole", region_name: "Akershus", can_vote: true },
    { name: "Harestua skole", region_name: "Akershus", can_vote: true },
    {
      name: "Haugjordet ungdomsskole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Hvam videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Lillestrøm videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Marikollen ungdomsskole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Nadderud videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Nannestad videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Nesbru videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Nesodden videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Nordbytun ungdomsskole", region_name: "Akershus", can_vote: true },
    { name: "Ramstad skole", region_name: "Akershus", can_vote: true },
    {
      name: "Roald Amundsen videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Rosenvilde videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Rud videregående skole", region_name: "Akershus", can_vote: true },
    {
      name: "Rudolf Steinerskolen stiftelsen avd. Undervisning (Nesodden)",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Rælingen videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Røyken videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Sandvika videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Ski videregående skole", region_name: "Akershus", can_vote: true },
    {
      name: "Stabekk videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Steinerskolen på Eidsvoll",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Strømmen videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Sørumsand videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Tangenåsen ungdomsskole",
      region_name: "Akershus",
      can_vote: true,
    },
    {
      name: "Valler videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Vestby ungdomsskole", region_name: "Akershus", can_vote: true },
    {
      name: "Vestby videregående skole",
      region_name: "Akershus",
      can_vote: true,
    },
    { name: "Vollen ungdomsskole", region_name: "Akershus", can_vote: true },

    { name: "Akademiet Drammen AS", region_name: "Buskerud", can_vote: true },
    {
      name: "Akademiet Ypsilon videregående skole AS",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "Briskeby videregående skole AS",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "Buskerud videregående skole avd. Rosthaug",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "Drammen videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "Eiker videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },
    { name: "Gol videregående skole", region_name: "Buskerud", can_vote: true },
    { name: "Hokksund ungdomsskole", region_name: "Buskerud", can_vote: true },
    {
      name: "Hønefoss videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "Kongsberg videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "Lier videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "Numedal videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "Ringerike videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },
    {
      name: "St. Hallvard videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },
    { name: "Ål videregående skole", region_name: "Buskerud", can_vote: true },
    {
      name: "Åssiden videregående skole",
      region_name: "Buskerud",
      can_vote: true,
    },

    {
      name: "Alta videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    { name: "Breilia skole", region_name: "Finnmark", can_vote: true },
    {
      name: "Båtsfjord Private videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Hammerfest videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    { name: "Honningvsåg skole", region_name: "Finnmark", can_vote: true },
    { name: "Karasjok skole", region_name: "Finnmark", can_vote: true },
    {
      name: "Kirkenes videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Lakselv videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    { name: "Melkarn Oppvekstsenter", region_name: "Finnmark", can_vote: true },
    {
      name: "Nordkapp videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Samisk videregående skole avd. Karasjok",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Samisk videregående skole og reindriftsskole avd. Kautokeino",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Sandfallet ungdomsskole",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Sandnes og Bjørnevatn skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Tana videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Vadsø videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },
    {
      name: "Vardø videregående skole",
      region_name: "Finnmark",
      can_vote: true,
    },

    {
      name: "Individuelt medlem i Elevorganisasjonen",
      region_name: "Individuelt Medlemsskap",
      can_vote: false,
    },

    {
      name: "Elverum Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Engerdal barne- og ungdomsskole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Gausdal Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Gjøvik Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Grue barne- og ungdomskole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Hadeland Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    { name: "Hamar Katedralskole", region_name: "Innlandet", can_vote: true },
    {
      name: "Jønsberg Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Kongsvinger Ungdomsskole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Lena-Valle Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Lillehammer Videregående Skole avd Nord",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Lillehammer Videregående Skole avd Sør",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Nord-Gudbrandsdalen Videregående Skole avd Otta",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Nord-Østerdal Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    { name: "Otta Ungdomsskole", region_name: "Innlandet", can_vote: true },
    {
      name: "Raufoss Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Ringsaker Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Sentrum Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Skarnes Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Solør Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Stange Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Steinerskolen på Hedemarken",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Storsteigen Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Trysil Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Valdres Vidaregåande Skule",
      region_name: "Innlandet",
      can_vote: true,
    },
    {
      name: "Vinstra Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },
    { name: "Åretta Ungdomsskole", region_name: "Innlandet", can_vote: true },
    { name: "Åsnes Ungdomsskole", region_name: "Innlandet", can_vote: true },
    {
      name: "Øvrebyen Videregående Skole",
      region_name: "Innlandet",
      can_vote: true,
    },

    {
      name: "Atlanten videregående skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Blindheim ungdomsskole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Borgund videregående skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    { name: "Dalsfjord skule", region_name: "Møre og Romsdal", can_vote: true },
    {
      name: "Gjermundnes videregående skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Haram videregående skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Hustadvika videregående skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Kolvikbakken ungdomsskole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Kristiansund Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Molde Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    { name: "Myklebust Skule", region_name: "Møre og Romsdal", can_vote: true },
    { name: "Måndalen skule", region_name: "Møre og Romsdal", can_vote: true },
    {
      name: "Rauma videregående skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Romsdal Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Skarbøvik Ungdomsskole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Spjelkavik Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Stranda Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Sunndal Ungdomsskole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Sunndal Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Surnadal Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Sykkylven videregående skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Tingvoll Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Ulstein Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Volda Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Åfarnes Barne- Og Ungdomsskole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Ålesund Videregående Skole avd Volsdalsberga",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Ålesund videregående skole avd Fagerlia",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },
    {
      name: "Ørsta Videregående Skole",
      region_name: "Møre og Romsdal",
      can_vote: true,
    },

    { name: "Alstad ungdomsskole", region_name: "Nordland", can_vote: true },
    {
      name: "Andøy Videregående Skole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Aust-Lofoten Videregående Skole",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Ballangen skole", region_name: "Nordland", can_vote: true },
    {
      name: "Bodin videregående skole og maritime fagskole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Bodø Videregående Skole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Brønnøysund Videregående Skole",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Enga Skole", region_name: "Nordland", can_vote: true },
    {
      name: "Fauske Videregående Skole avd Vestmyra",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Grane barne- og ungdomsskole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Hadsel Videregående Skole avd Melbu",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Hadsel Videregående Skole avd Stokmarknes",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Hemnes Sentralskole", region_name: "Nordland", can_vote: true },
    { name: "Henningsvær skole", region_name: "Nordland", can_vote: true },
    { name: "Herøy Skole", region_name: "Nordland", can_vote: true },
    {
      name: "Hilstad Barne- Og Ungdomsskole",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Hunstad Ungdomsskole", region_name: "Nordland", can_vote: true },
    { name: "Husøy Skole", region_name: "Nordland", can_vote: true },
    { name: "Inndyr Skole", region_name: "Nordland", can_vote: true },
    { name: "Kabelvåg Ungdomsskole", region_name: "Nordland", can_vote: true },
    {
      name: "Kippermoen Ungdomsskole",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Korgen Sentralskole", region_name: "Nordland", can_vote: true },
    {
      name: "Kristen Videregående Skole Nordland",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Løpsmark Skole", region_name: "Nordland", can_vote: true },
    { name: "Melbu Skole", region_name: "Nordland", can_vote: true },
    {
      name: "Meløy videregående skole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Mosjøen Videregående Skole, avd. Kippermoen",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Mosjøen Videregående Skole, avd. Marka",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Narvik Videregående Skole avd Frydenlund",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Narvik Videregående Skole avd Oscarsborg",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Narvik Videregående Skole avd Solhaugen",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Nord-Salten videregående skole (avd Joarkkaskåvllå og Steigen)",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Polarsirkelen Videregående Skole",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Rønvik Skole", region_name: "Nordland", can_vote: true },
    {
      name: "Saltdal Videregående Skole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Sandnessjøen Videregående Skole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Sortland videregående skole avd. Sortland, Kleiva og Øksnes",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Svolvær skole", region_name: "Nordland", can_vote: true },
    { name: "Tverlandet Skole", region_name: "Nordland", can_vote: true },
    {
      name: "Utskarpen Barne- og Ungdomsskole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Vega Barne- og Ungdomsskole",
      region_name: "Nordland",
      can_vote: true,
    },
    {
      name: "Vest-Lofoten Videregående Skole",
      region_name: "Nordland",
      can_vote: true,
    },
    { name: "Ørnes Skole", region_name: "Nordland", can_vote: true },

    { name: "Apalløkka skole", region_name: "Oslo", can_vote: true },
    { name: "Bjørnholt Ungdomsskole", region_name: "Oslo", can_vote: true },
    {
      name: "Bjørnholt Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    {
      name: "Blindern Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Brannfjell skole", region_name: "Oslo", can_vote: true },
    { name: "Bøler Skole", region_name: "Oslo", can_vote: true },
    {
      name: "Edvard Munch Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Ellingsrud Skole", region_name: "Oslo", can_vote: true },
    {
      name: "Elvebakken Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    {
      name: "Etterstad Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Fagerborg Skole", region_name: "Oslo", can_vote: true },
    { name: "Foss Videregående Skole", region_name: "Oslo", can_vote: true },
    { name: "Frydenberg Skole", region_name: "Oslo", can_vote: true },
    {
      name: "Fyrstikkalleén Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Fyrstikkalléen Skole", region_name: "Oslo", can_vote: true },
    { name: "Groruddalen Skole", region_name: "Oslo", can_vote: true },
    { name: "Hartvig Nissens Skole", region_name: "Oslo", can_vote: true },
    { name: "Haugerud Skole", region_name: "Oslo", can_vote: true },
    { name: "Hauketo Skole", region_name: "Oslo", can_vote: true },
    {
      name: "Hellerud Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Heltberg Private Gymnas", region_name: "Oslo", can_vote: true },
    { name: "Hersleb Videregående Skole", region_name: "Oslo", can_vote: true },
    { name: "Holmlia Skole", region_name: "Oslo", can_vote: true },
    { name: "Hovseter Skole", region_name: "Oslo", can_vote: true },
    { name: "Jordal Skole", region_name: "Oslo", can_vote: true },
    {
      name: "Kongsskogen Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Kuben Videregående Skole", region_name: "Oslo", can_vote: true },
    {
      name: "Lambertseter Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Lambertseter grunnskole", region_name: "Oslo", can_vote: true },
    { name: "Lofsrud Skole", region_name: "Oslo", can_vote: true },
    { name: "Marienlyst Skole", region_name: "Oslo", can_vote: true },
    { name: "Midtstuen Skole", region_name: "Oslo", can_vote: true },
    { name: "Natur Videregående Skole", region_name: "Oslo", can_vote: true },
    { name: "Nordberg Skole", region_name: "Oslo", can_vote: true },
    { name: "Nydalen Videregående Skole", region_name: "Oslo", can_vote: true },
    { name: "Nyskolen i Oslo", region_name: "Oslo", can_vote: true },
    { name: "Oppsal Skole", region_name: "Oslo", can_vote: true },
    { name: "Oslo By Steinerskole", region_name: "Oslo", can_vote: true },
    { name: "Oslo Katedralskole", region_name: "Oslo", can_vote: true },
    {
      name: "Persbråten Videregående Skole",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Ris Skole", region_name: "Oslo", can_vote: true },
    {
      name: "Rudolf Steinerskolen i Oslo",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Ruseløkka Skole", region_name: "Oslo", can_vote: true },
    { name: "Sagene Skole", region_name: "Oslo", can_vote: true },
    { name: "Skullerud Skole", region_name: "Oslo", can_vote: true },
    { name: "Skøyenåsen Skole", region_name: "Oslo", can_vote: true },
    { name: "Sofienberg Skole", region_name: "Oslo", can_vote: true },
    { name: "Sollerudstranda Skole", region_name: "Oslo", can_vote: true },
    { name: "St. Sunniva Skole", region_name: "Oslo", can_vote: true },
    { name: "Stasjonsfjellet skole", region_name: "Oslo", can_vote: true },
    {
      name: "Stiftelsen Den Tyske Skoleforening i Norge",
      region_name: "Oslo",
      can_vote: true,
    },
    { name: "Stovner Videregående Skole", region_name: "Oslo", can_vote: true },
    { name: "Ullern Videregående Skole", region_name: "Oslo", can_vote: true },
    { name: "Ulsrud Videregående Skole", region_name: "Oslo", can_vote: true },
    { name: "Vika videregående skole", region_name: "Oslo", can_vote: true },
    { name: "Øraker skole", region_name: "Oslo", can_vote: true },

    { name: "Akademiet Sandnes", region_name: "Rogaland", can_vote: true },
    {
      name: "Bergeland Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    { name: "Bokn Skule", region_name: "Rogaland", can_vote: true },
    {
      name: "Bryne Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Dalane Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    { name: "Forsand Skule", region_name: "Rogaland", can_vote: true },
    {
      name: "Godalen Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Haugaland Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Hetland Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Hjelmeland Ungdomsskule",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Jåttå Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Karmsund Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Kopervik Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Randaberg Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Sandnes Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Sauda Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Skeisvang Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "St. Olav Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Stavanger Katedralskole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Strand Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Vardafjell videregående skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Vågen Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Øksnevad Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    {
      name: "Ølen Videregående Skole",
      region_name: "Rogaland",
      can_vote: true,
    },
    { name: "Øygard Ungdomsskole", region_name: "Rogaland", can_vote: true },

    {
      name: "Bamble videregående skole",
      region_name: "Telemark",
      can_vote: true,
    },
    { name: "Bø ungdomsskule", region_name: "Telemark", can_vote: true },
    { name: "Bø videregåande skule", region_name: "Telemark", can_vote: true },
    {
      name: "Hjalmar Johansen videregående skole",
      region_name: "Telemark",
      can_vote: true,
    },
    {
      name: "Kragerø videregående skole",
      region_name: "Telemark",
      can_vote: true,
    },
    { name: "Mæla ungdomsskole", region_name: "Telemark", can_vote: true },
    {
      name: "Nome videregående skole, avd Lunde",
      region_name: "Telemark",
      can_vote: true,
    },
    {
      name: "Nome videregående skole, avd Søve",
      region_name: "Telemark",
      can_vote: true,
    },
    {
      name: "Notodden videregående skole",
      region_name: "Telemark",
      can_vote: true,
    },
    {
      name: "Rjukan videregående skole",
      region_name: "Telemark",
      can_vote: true,
    },
    {
      name: "Skien videregående skole",
      region_name: "Telemark",
      can_vote: true,
    },
    {
      name: "Stiftelsen Toppidrettsgymnaset i Telemark",
      region_name: "Telemark",
      can_vote: true,
    },
    {
      name: "Telemark toppidrett ungdomsskole",
      region_name: "Telemark",
      can_vote: true,
    },
    {
      name: "Vest-Telemark videregående skole, avd Dalen og Seljord",
      region_name: "Telemark",
      can_vote: true,
    },

    { name: "Bardu ungdomsskole", region_name: "Troms", can_vote: true },
    {
      name: "Bardufoss videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Breivang videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    { name: "Finnsnes ungdomsskole", region_name: "Troms", can_vote: true },
    {
      name: "Gibostad barne- og ungdomsskole",
      region_name: "Troms",
      can_vote: true,
    },
    { name: "Hagebyen skole", region_name: "Troms", can_vote: true },
    { name: "Heggen videregående skole", region_name: "Troms", can_vote: true },
    {
      name: "Hillesøyskolen - Brensholmen skole",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Ishavsbyen videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Kongsbakken videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Kvaløya videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    { name: "Lavangen skole", region_name: "Troms", can_vote: true },
    {
      name: "Longyearbyen skole, grunnskole",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Longyearbyen skole, videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    { name: "Malangen Skole", region_name: "Troms", can_vote: true },
    {
      name: "Nord-Troms videregående skole (avd. Nordreisa og Skjervøy)",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Nordborg videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Nordkjosbotn videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    { name: "Salangen skole", region_name: "Troms", can_vote: true },
    { name: "Seljestad ungdomsskole", region_name: "Troms", can_vote: true },
    {
      name: "Senja videregående skole, avd. Finnfjordbotn",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Senja videregående skole, avd. Gibostad",
      region_name: "Troms",
      can_vote: true,
    },
    {
      name: "Sjøvegan videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    { name: "Sommerlyst skole", region_name: "Troms", can_vote: true },
    { name: "Sørreisa sentralskole", region_name: "Troms", can_vote: true },
    {
      name: "Tromsdalen videregående skole",
      region_name: "Troms",
      can_vote: true,
    },
    { name: "Tromstun skole", region_name: "Troms", can_vote: true },

    {
      name: "Aglo Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Bybroen Videregående Skole AS",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Byåsen videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Charlottenlund Ungdomsskole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Charlottenlund Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Fosen Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Gauldal Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Grong Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    { name: "Grong ungdomsskole", region_name: "Trøndelag", can_vote: true },
    {
      name: "Guri Kunna Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    { name: "Halsen Ungdomsskole", region_name: "Trøndelag", can_vote: true },
    {
      name: "Heimdal Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Inderøy Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Johan Bojer videregående skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Kyrksæterøra videregående skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    { name: "Lauvsnes Skole", region_name: "Trøndelag", can_vote: true },
    {
      name: "Levanger Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Lærlingrådet i Trøndelag",
      region_name: "Trøndelag",
      can_vote: true,
    },
    { name: "Malm skole", region_name: "Trøndelag", can_vote: true },
    {
      name: "Malvik Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Meldal Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Melhus Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Meråker Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    { name: "Mære Landbruksskole", region_name: "Trøndelag", can_vote: true },
    {
      name: "Olav Duun Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Ole Vig Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Oppdal Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Orkdal Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Røros Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Skjetlein Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    { name: "Steinerskolen Rotvoll", region_name: "Trøndelag", can_vote: true },
    {
      name: "Steinerskolen i Trondheim, Grunnskole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Steinkjer Montessoriskole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Steinkjer Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Strinda Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Thora Storm Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Tiller Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Trondheim Katedralskole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Trondheim international school",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Verdal Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Vikhammer Ungdomsskole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Ytre Namdal Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    {
      name: "Åfjord videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },
    { name: "Årlivoll skole", region_name: "Trøndelag", can_vote: true },
    { name: "Øya Ungdomsskole", region_name: "Trøndelag", can_vote: true },
    {
      name: "Øya Videregående Skole",
      region_name: "Trøndelag",
      can_vote: true,
    },

    {
      name: "Færder videregående skole",
      region_name: "Vestfold",
      can_vote: true,
    },
    {
      name: "Greveskogen videregående skole",
      region_name: "Vestfold",
      can_vote: true,
    },
    {
      name: "Holmestrand videregående skole",
      region_name: "Vestfold",
      can_vote: true,
    },
    {
      name: "Nøtterøy videregående skole",
      region_name: "Vestfold",
      can_vote: true,
    },
    { name: "Revetal ungdomsskole", region_name: "Vestfold", can_vote: true },
    {
      name: "Sande Videregående skole",
      region_name: "Vestfold",
      can_vote: true,
    },
    {
      name: "Steinerskolen i Vestfold - Grunnskolen på Nøtterøy",
      region_name: "Vestfold",
      can_vote: true,
    },
    {
      name: "Steinerskolen i Vestfold - Slottsfjellet videregående",
      region_name: "Vestfold",
      can_vote: true,
    },
    { name: "Tjodalyng skole", region_name: "Vestfold", can_vote: true },

    {
      name: "Amalie Skram Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Arna Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Askvoll Skole", region_name: "Vestland", can_vote: true },
    {
      name: "Askøy Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Austevoll Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Austrheim Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Bergen Katedralskole", region_name: "Vestland", can_vote: true },
    {
      name: "Bergen Katedralskole avd Kyrre",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Bømlo Videregående Skole, avd. Leite",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Bømlo Videregående skole, avd. Rubbestadneset",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Dale Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Eid Videregående Skole", region_name: "Vestland", can_vote: true },
    {
      name: "Firda Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Flora Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Fusa Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Fyllingsdalen Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Førde Ungdomsskole", region_name: "Vestland", can_vote: true },
    {
      name: "Førde videregående skule",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Granvin ungdomsskole", region_name: "Vestland", can_vote: true },
    { name: "Halbrend Skole", region_name: "Vestland", can_vote: true },
    { name: "Hauso Skole", region_name: "Vestland", can_vote: true },
    {
      name: "Høyanger Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Kjøkkelvik skole", region_name: "Vestland", can_vote: true },
    {
      name: "Knarvik Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Krokeide videregående skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Kvam Ungdomsskole", region_name: "Vestland", can_vote: true },
    {
      name: "Kvam vidaregåande skule",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Kyrkjekrinsen ungdomsskole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Laksevåg og Bergen Maritime Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Langhaugen Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Metis Videregående Skole AS",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Måløy Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Nordahl Grieg Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Odda Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Olsvikåsen Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Os Gymnas", region_name: "Vestland", can_vote: true },
    { name: "Os Videregående Skole", region_name: "Vestland", can_vote: true },
    {
      name: "Osterøy Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Sandsli videregående skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Slåtthaug Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Sogndal Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Sotra Videregående Skole avd Bildøy",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Sotra Videregående Skole avd Sund",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Stend Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Stord Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Strandebarm Skule", region_name: "Vestland", can_vote: true },
    {
      name: "Stryn Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "Sund Ungdomsskole", region_name: "Vestland", can_vote: true },
    {
      name: "Tertnes Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "UWC Red Cross Nordic", region_name: "Vestland", can_vote: true },
    { name: "Voss Gymnas", region_name: "Vestland", can_vote: true },
    {
      name: "Voss Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    { name: "kjøkkelvik skole", region_name: "Vestland", can_vote: true },
    {
      name: "Årdal Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Årstad Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },
    {
      name: "Åsane Videregående Skole",
      region_name: "Vestland",
      can_vote: true,
    },

    {
      name: "Akademiet Fredrikstad AS",
      region_name: "Østfold",
      can_vote: true,
    },
    { name: "Askim ungdomsskole", region_name: "Østfold", can_vote: true },
    {
      name: "Askim videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    { name: "Borg videregående skole", region_name: "Østfold", can_vote: true },
    { name: "Borge ungdomsskole", region_name: "Østfold", can_vote: true },
    {
      name: "Frederik II videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    {
      name: "Glemmen videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    { name: "Gressvik ungdomsskole", region_name: "Østfold", can_vote: true },
    {
      name: "Greåker videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    {
      name: "Halden videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    { name: "Haugeåsen ungdomsskole", region_name: "Østfold", can_vote: true },
    {
      name: "Hvaler barne- og ungdomsskole",
      region_name: "Østfold",
      can_vote: true,
    },
    {
      name: "Kalnes videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    {
      name: "Kirkebygden ungdomsskole (Våler)",
      region_name: "Østfold",
      can_vote: true,
    },
    {
      name: "Kirkeparken videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    {
      name: "Knapstad brane- og ungdomsskole",
      region_name: "Østfold",
      can_vote: true,
    },
    { name: "Kråkerøy ungdomsskole", region_name: "Østfold", can_vote: true },
    { name: "Kvernhuset ungdomsskole", region_name: "Østfold", can_vote: true },
    {
      name: "Malakoff videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    { name: "Mysen ungdomsskole", region_name: "Østfold", can_vote: true },
    {
      name: "Mysen videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    { name: "Spydeberg ungdomsskole", region_name: "Østfold", can_vote: true },
    {
      name: "Steinerskolen i Fredrikstad",
      region_name: "Østfold",
      can_vote: true,
    },
    {
      name: "Steinerskolen i Moss, grunnskole",
      region_name: "Østfold",
      can_vote: true,
    },
    {
      name: "Steinerskolen i Moss, videregående skole",
      region_name: "Østfold",
      can_vote: true,
    },
    { name: "Trøgstad ungdomsskole", region_name: "Østfold", can_vote: true },
    { name: "Vestbygda ungdomsskole", region_name: "Østfold", can_vote: true },

    {
      name: "Distriktskomiteene i Operasjon Dagsverk",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Agder",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Akershus",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Bergen",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Buskerud",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Finnmark",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Innlandet",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Møre og Romsdal",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Nordland",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Oslo",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Oslo Sentrum",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Oslo Vest",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Oslo Øst",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Rogaland",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Telemark",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Troms",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Trondheim",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Trøndelag",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Vestfold",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Vestland",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Elevorganisasjonen i Østfold",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Generalsekretær",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Gjest med innvilget talerett",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Hovedkomiteen i Operasjon Dagsverk",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Kontrollkomiteen",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Ordstyrerbordet",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    { name: "Referenter", region_name: "Elevorganisasjonen", can_vote: false },
    {
      name: "Sentralstyret",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
    {
      name: "Valgkomitéen",
      region_name: "Elevorganisasjonen",
      can_vote: false,
    },
  ];
  // 4. Seed Organizations (Optional example)
  console.log("...Seeding Organizations");
  // Just adding one example organization to the first region (Agder)
  for (const org of ORGANIZATIONS_DATA) {
    const regionId = regionNameMap.get(org.region_name);

    if (!regionId) {
      console.warn(
        `[ADVARSEL] Hopper over organisasjon ${org.name}: Region '${org.region_name}' ble ikke funnet.`
      );
      continue;
    }

    await prisma.organization.upsert({
      where: { name: org.name },
      update: {
        canVote: org.can_vote,
        regionId: regionId, // ✅ Knytter til Region ID
      },
      create: {
        name: org.name,
        canVote: org.can_vote,
        regionId: regionId,
      },
    });
  }
  // 5. Seed/Update YOUR User
  const adminRoleReference = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });
  const adminRoleId = adminRoleReference?.id; // Bruk optional chaining for sikkerhet
  const eoRegionId = regionNameMap.get("Elevorganisasjonen");

  if (!adminRoleId) {
    throw new Error(
      "Kritisk feil: Fant ikke ADMIN-rollen i databasen. Sjekk trinn 2."
    );
  }

  const myEmail = "birk@elev.no";
  console.log(`...Seeding User: ${myEmail}`);

  await prisma.whitelist.upsert({
    where: { email: myEmail },
    update: {
      // ✅ KORREKT: Bruk den garanterte ID-en
      role: { connect: { id: adminRoleId } },
      // ✅ KORREKT: Håndter region ID som kan være undefined
      region: eoRegionId ? { connect: { id: eoRegionId } } : undefined,
    },
    create: {
      email: myEmail,
      role: { connect: { id: adminRoleId } },
      region: eoRegionId ? { connect: { id: eoRegionId } } : undefined,
    },
  });

  console.log("...Seeding start date");
  await prisma.config.upsert({
    where: { key: "START_DATE" },
    update: { value: "2025-01-01" },
    create: {
      key: "START_DATE",
      value: "2025-01-01",
    },
  });

  console.log("✅ Seeding finished.");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
