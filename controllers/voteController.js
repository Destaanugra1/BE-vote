const supabase = require('../utils/supabaseClient');

exports.vote = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const candidate_id = req.body.candidate_id; // ambil dari body
  try {
    if (role !== 'admin') {
      // Cek apakah user sudah pernah vote (untuk kandidat manapun)
      const { count, error: checkError } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (checkError) throw checkError;
      if (count > 0) {
        return res.status(400).json({ message: 'You have already voted.' });
      }
    }
    // Admin atau user yang belum pernah vote kandidat ini
    const { data, error } = await supabase.from('votes').insert({ user_id: userId, candidate_id });
    if (error) throw error;
    res.status(201).json({ message: 'Vote casted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVoteStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('candidate_id, candidates(name), count:count(*)')
      .group('candidate_id, candidates(name)');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
