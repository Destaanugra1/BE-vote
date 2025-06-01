const supabase = require('../utils/supabaseClient');
const cloudinary = require('../utils/cloudinary');

exports.createCandidate = async (req, res) => {
  try {
    const { name, vision, mission } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image provided' });

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'voting-app' },
      async (error, result) => {
        if (error) return res.status(500).json({ error: 'Upload failed' });

        const { data, error: dbError } = await supabase.from('candidates').insert({
          name,
          vision,
          mission,
          photo_url: result.secure_url,
        });

        if (dbError) return res.status(500).json({ error: dbError.message });
        res.status(201).json({ message: 'Candidate created', data });
      }
    );

    stream.end(file.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, vision, mission } = req.body;
    let photo_url = req.body.photo_url; // default: pakai yang lama

    // Jika ada file foto baru, upload ke Cloudinary
    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'voting-app' },
        async (error, result) => {
          if (error) return res.status(500).json({ error: 'Upload failed' });

          photo_url = result.secure_url;

          const { error: dbError } = await supabase
            .from('candidates')
            .update({ name, vision, mission, photo_url })
            .eq('id', id);

          if (dbError) return res.status(500).json({ error: dbError.message });
          res.json({ message: 'Candidate updated' });
        }
      );
      stream.end(req.file.buffer);
    } else {
      // Jika tidak ada file baru, update data tanpa ganti foto
      const { error: dbError } = await supabase
        .from('candidates')
        .update({ name, vision, mission, photo_url })
        .eq('id', id);

      if (dbError) return res.status(500).json({ error: dbError.message });
      res.json({ message: 'Candidate updated' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    // Ambil semua kandidat
    const { data: candidates, error } = await supabase.from('candidates').select('*');
    if (error) throw error;

    // Untuk setiap kandidat, hitung jumlah vote
    const candidatesWithVotes = await Promise.all(
      candidates.map(async (candidate) => {
        const { count, error: voteError } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', candidate.id);
        return { ...candidate, votes: count || 0 };
      })
    );

    res.json(candidatesWithVotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    // Hapus kandidat dari database
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
