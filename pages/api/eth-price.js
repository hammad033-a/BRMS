
export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=pkr');
    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }
    const data = await response.json();
    if (data && data.ethereum && data.ethereum.pkr) {
      res.status(200).json({ rate: data.ethereum.pkr });
    } else {
      res.status(500).json({ error: 'Invalid response from CoinGecko' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
} 