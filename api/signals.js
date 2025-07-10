export default async function handler(req, res) {
  try {
    const response = await fetch('http://188.165.71.103:3000/api/signals');
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
}
