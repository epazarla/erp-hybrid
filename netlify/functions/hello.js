// Netlify Function örneği
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Merhaba Dünya!" }),
    headers: {
      'Content-Type': 'application/json',
    },
  }
}
