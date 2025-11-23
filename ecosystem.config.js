module.exports = {
  apps: [
    {
      name: 'artalk',
      script: './bin/artalk',
      args: ['server'],
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
}