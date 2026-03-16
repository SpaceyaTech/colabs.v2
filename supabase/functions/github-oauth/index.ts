import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { code, state } = await req.json()
    
    if (!code) {
      throw new Error('Authorization code is required')
    }

    console.log('Exchanging GitHub OAuth code for access token')

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: Deno.env.get('GITHUB_CLIENT_ID'),
        client_secret: Deno.env.get('GITHUB_CLIENT_SECRET'),
        code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'OAuth error')
    }

    const accessToken = tokenData.access_token

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch GitHub user info')
    }

    const githubUser = await userResponse.json()

    console.log(`GitHub user authenticated: ${githubUser.login}`)

    // Get the authenticated user from Supabase
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    // Store or update GitHub integration
    const { data: integration, error: integrationError } = await supabase
      .from('github_integrations')
      .upsert({
        user_id: user.id,
        github_user_id: githubUser.id,
        github_username: githubUser.login,
        access_token: accessToken,
        avatar_url: githubUser.avatar_url,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (integrationError) {
      console.error('Integration error:', integrationError)
      throw new Error('Failed to store GitHub integration')
    }

    console.log(`GitHub integration stored for user ${user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        integration,
        github_user: {
          id: githubUser.id,
          login: githubUser.login,
          avatar_url: githubUser.avatar_url
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('GitHub OAuth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})