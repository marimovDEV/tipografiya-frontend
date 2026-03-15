import { createServerClient } from "@supabase/ssr"

/**
 * Run this script to create a test user in Supabase
 *
 * Requirements:
 * - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set
 * - Run: npx ts-node scripts/create-test-user.ts
 */

async function createTestUser() {
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {},
    },
  })

  try {
    // Create test user
    const { data, error } = await supabase.auth.admin.createUser({
      email: "admin@printrp.local",
      password: "PrintERP@2025!Secure",
      email_confirm: true,
      user_metadata: {
        first_name: "Test",
        last_name: "Admin",
      },
    })

    if (error) {
      console.error("Error creating user:", error.message)
      return
    }

    console.log("✅ Test user created successfully!")
    console.log("Email:", data.user?.email)
    console.log("User ID:", data.user?.id)

    // Get admin role ID
    const { data: roleData } = await supabase.from("roles").select("id").eq("name", "Admin").single()

    if (roleData) {
      // Update user profile with admin role
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role_id: roleData.id })
        .eq("id", data.user?.id)

      if (updateError) {
        console.error("Error updating role:", updateError.message)
      } else {
        console.log("✅ Admin role assigned!")
      }
    }

    console.log("\n📋 Test Credentials:")
    console.log("Email: admin@printrp.local")
    console.log("Password: PrintERP@2025!Secure")
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

createTestUser()
