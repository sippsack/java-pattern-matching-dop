const endpoint = 'https://bxl7iq6fgjx6zcfh5pzsrhqqoe.apigateway.us-ashburn-1.oci.customer-oci.com/api/execute'

export async function runDevJava(code, fetcher = fetch, setup = '') {
  const prefix = setup ? `${setup}\n` : ''
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: JSON.stringify({
      option: 'na',
      prefixId: '',
      snippet: Buffer.from(prefix + code, 'utf8').toString('base64'),
    }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) throw new Error(`dev.java antwortet mit HTTP ${response.status}.`)
  const result = await response.json()
  if (typeof result?.errorMessage === 'string' && result.errorMessage) {
    throw new Error(`dev.java: ${result.errorMessage}`)
  }
  if (!Array.isArray(result?.body) || !result.body.every(row =>
    row !== null && typeof row === 'object'
    && typeof row.out === 'string' && typeof row.val === 'string'
    && typeof row.exc === 'boolean' && typeof row.status === 'string')) {
    throw new Error('Unerwartetes Antwortformat von dev.java. Die externe API könnte sich geändert haben.')
  }
  const internalError = result.body.find(row => row.status === 'RECOVERABLE_DEFINED' && row.out === 'Error, unhandled state.')
  if (internalError) {
    throw new Error(`dev.java konnte eine Vorwärtsreferenz nicht verarbeiten: ${internalError.val}. Abhängigkeiten vor dem Beispiel deklarieren oder ein lokales JDK beziehungsweise Java Almanac wählen.`)
  }
  return {
    ok: result.body.every(row => !row.exc && row.status !== 'REJECTED'),
    runtime: 'dev.java · Anbieter-JDK',
    output: result.body.map(row => {
      const setupLines = prefix.split('\n').length - 1
      if (prefix && typeof row.lineStart !== 'number') {
        throw new Error('dev.java liefert keine Zeilenzuordnung zum Ausblenden des Setups.')
      }
      if (prefix && row.lineStart <= setupLines && !row.exc && row.status !== 'REJECTED') return ''
      const lines = []
      if (row.out) lines.push(row.out.replace(/\n$/, ''))
      if (row.val) lines.push(`${row.exc || row.status === 'REJECTED' ? 'Fehler: ' : '=> '}${row.val}`)
      if ((row.exc || row.status === 'REJECTED') && !row.out && !row.val) {
        lines.push(`Fehler: ${row.status}`)
      }
      return lines.join('\n')
    }).filter(Boolean).join('\n'),
  }
}
