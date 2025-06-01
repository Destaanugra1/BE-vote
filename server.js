const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const WebSocket = require('ws');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Haiiii love youu❤️');
});

// WebSocket setup
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const supabase = require('./utils/supabaseClient');

// Broadcast function
async function broadcastCandidates() {
  console.log('Broadcasting candidates...');
  // Ambil semua kandidat
  const { data: candidates } = await supabase.from('candidates').select('*');
  // Ambil semua votes
  const { data: votes } = await supabase.from('votes').select('*');

  // Hitung votes untuk setiap kandidat
  const candidatesWithVotes = candidates.map((candidate) => {
    const voteCount = votes.filter(
      (v) => v.candidate_id === candidate.id
    ).length;
    return { ...candidate, votes: voteCount };
  });

  const payload = JSON.stringify({
    type: 'candidates',
    data: candidatesWithVotes,
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Kirim data awal saat client connect
wss.on('connection', async (ws) => {
  const { data: candidates } = await supabase.from('candidates').select('*');
  const { data: votes } = await supabase.from('votes').select('*');
  const candidatesWithVotes = candidates.map((candidate) => {
    const voteCount = votes.filter(
      (v) => v.candidate_id === candidate.id
    ).length;
    return { ...candidate, votes: voteCount };
  });
  ws.send(JSON.stringify({ type: 'candidates', data: candidatesWithVotes }));
});

// Panggil broadcastCandidates setiap kali ada voting baru
const voteController = require('./controllers/voteController');
const originalVote = voteController.vote;
voteController.vote = async (req, res) => {
  await originalVote(req, res);
  broadcastCandidates();
};

// Routes (setelah override controller!)
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);

// Jalankan server
if (require.main === module) {
  const port = process.env.PORT || 5000;
  server.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
