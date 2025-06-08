const cloudinary = require('../utils/cloudinary');
const supabase = require('../utils/supabaseClient');

exports.createFormatur = async (req, res) => {
  try {
    const { name, description } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No image provided' });

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'voting-app' },
      async (error, result) => {
        if (error) return res.status(500).json({ error: 'Upload failed' });

        const { data, error: dbError } = await supabase
          .from('formaturs')
          .insert({
            name,
            description,
            photo_url: result.secure_url,
          });

        if (dbError) return res.status(500).json({ error: dbError.message });
        res.status(201).json({ message: 'Formatur created', data });
      }
    );

    stream.end(file.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFormatur = async (req, res) => {
  try {
    const { data, error } = await supabase.from('formaturs').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.editFormatur = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const file = req.file;
    let photo_url = req.body.photo_url;

    if (file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'voting-app' },
        async (error, result) => {
          if (error) return res.status(500).json({ error: 'Upload failed' });
          photo_url = result.secure_url;

          const { error: dbError } = await supabase
            .from('formaturs')
            .update({ name, description, photo_url })
            .eq('id', id);

          if (dbError) return res.status(500).json({ error: dbError.message });
          res.json({ message: 'Formatur updated successfully' });
        }
      );
      stream.end(file.buffer);
    } else {
      const { error: dbError } = await supabase
        .from('formaturs')
        .update({ name, description, photo_url })
        .eq('id', id);

      if (dbError) return res.status(500).json({ error: dbError.message });
      res.json({ message: 'Formatur updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFormaturById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('formaturs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: 'Formatur not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFormatur = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('formaturs').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Formatur deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
