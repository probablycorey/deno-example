let creds = {
  database: 'twigs',
  host: 'localhost',
  hostname: 'localhost',
  port: 5432,
  user: 'corey',
  username: 'corey',
  password: 'password',
}

// DATABASE_URL is set by heroku
let url = Deno.env.get('DATABASE_URL')
if (url) {
  const {hostname, port, username, password, pathname} = new URL(url)
  creds.host = creds.hostname = hostname
  creds.port = Number(port)
  creds.user = creds.username = username
  creds.password = password
  creds.database = pathname.replace(/^\//, '')
}

export {creds}
