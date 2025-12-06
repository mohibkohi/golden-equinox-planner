require 'webrick'
require 'json'

# Configuration
PORT = 8080
DB_FILE = 'users.json'

# Helper to read users
def read_users
  if File.exist?(DB_FILE)
    content = File.read(DB_FILE)
    return [] if content.strip.empty?
    JSON.parse(content)
  else
    []
  end
end

# Helper to write users
def write_users(users)
  File.write(DB_FILE, JSON.pretty_generate(users))
end

# Initialize server
server = WEBrick::HTTPServer.new(Port: PORT, DocumentRoot: Dir.pwd)

# Signup Endpoint
server.mount_proc '/api/signup' do |req, res|
  if req.request_method == 'POST'
    begin
      body = JSON.parse(req.body)
      email = body['email']
      password = body['password']
      name = body['name']

      users = read_users

      if users.any? { |u| u['email'] == email }
        res.status = 409 # Conflict
        res.body = { error: 'User already exists' }.to_json
      else
        new_user = {
          'id' => "user_#{Time.now.to_i}",
          'email' => email,
          'password' => password, # Plaintext as requested for simplicity, in real app hash this!
          'name' => name,
          'createdAt' => Time.now.to_s
        }
        users << new_user
        write_users(users)

        res.status = 201 # Created
        res.body = { user: new_user.reject { |k| k == 'password' } }.to_json
      end
    rescue JSON::ParserError
      res.status = 400
      res.body = { error: 'Invalid JSON' }.to_json
    rescue => e
      res.status = 500
      res.body = { error: e.message }.to_json
    end
  else
    res.status = 405 # Method Not Allowed
  end
  res['Content-Type'] = 'application/json'
end

# Login Endpoint
server.mount_proc '/api/login' do |req, res|
  if req.request_method == 'POST'
    begin
      body = JSON.parse(req.body)
      email = body['email']
      password = body['password']

      users = read_users
      user = users.find { |u| u['email'] == email && u['password'] == password }

      if user
        res.status = 200
        res.body = { user: user.reject { |k| k == 'password' } }.to_json
      else
        res.status = 401 # Unauthorized
        res.body = { error: 'Invalid credentials' }.to_json
      end
    rescue JSON::ParserError
      res.status = 400
      res.body = { error: 'Invalid JSON' }.to_json
    rescue => e
      res.status = 500
      res.body = { error: e.message }.to_json
    end
  else
    res.status = 405 # Method Not Allowed
  end
  res['Content-Type'] = 'application/json'
end

# Trap INT to shutdown cleanly
trap('INT') { server.shutdown }

puts "Starting Golden Equinox Server on port #{PORT}..."
server.start
