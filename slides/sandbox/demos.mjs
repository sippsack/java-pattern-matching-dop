/**
 * @param {unknown} name
 * @param {Record<string, string>} files
 * @returns {{ code: string, checkpoints: string[], setups?: string[], labels?: string[] } | { error: string }}
 */
export function resolveDemo(name, files) {
  if (typeof name !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(name)) {
    return { error: 'sandbox muss einen Demo-Namen ohne Pfad oder Dateiendung enthalten.' }
  }
  const single = files[`../demos/${name}.java`]
  const prefix = `../demos/${name}-`
  const steps = Object.keys(files)
    .filter(path => path.startsWith(prefix) && /^\d+(?:-[a-zA-Z0-9][a-zA-Z0-9_-]*)?\.java$/.test(path.slice(prefix.length)))
    .map(path => ({ path, number: Number.parseInt(path.slice(prefix.length), 10) }))
    .sort((a, b) => a.number - b.number)
  if (single !== undefined && steps.length) {
    return { error: `Demo ${name}: Einzeldatei und nummerierte Dateien nicht gleichzeitig verwenden.` }
  }
  if (steps.some((step, index) => index > 0 && step.number === steps[index - 1].number)) {
    return { error: `Demo ${name}: Nummern der Zwischenstände müssen eindeutig sein.` }
  }
  if (single !== undefined) return { code: single, checkpoints: [] }
  if (!steps.length) return { error: `Keine Java-Dateien für Demo ${name} in slides/demos/ gefunden.` }
  const sources = steps.map(step => files[step.path])
  const setups = sources.map(source => {
    const setup = source.match(/^\/\/ @setup ([a-zA-Z0-9][a-zA-Z0-9_-]*\.java)\r?\n/)
    return setup ? files[`../demos/${setup[1]}`] : ''
  })
  if (setups.some(setup => setup === undefined)) {
    return { error: `Demo ${name}: Eine @setup-Datei fehlt in slides/demos/.` }
  }
  if (setups.some(setup => /^\/\/ @setup /m.test(setup))) {
    return { error: `Demo ${name}: Verschachtelte @setup-Verweise sind nicht erlaubt.` }
  }
  const code = sources.map(source => source.replace(/^\/\/ @setup [^\r\n]+\r?\n/, ''))
  return {
    code: code[0], checkpoints: code.slice(1),
    ...(setups.some(Boolean) || steps.some(step => /^\d+-/.test(step.path.slice(prefix.length))) ? {
      setups,
      labels: steps.map(step => step.path.slice(prefix.length).replace(/^\d+-?/, '').replace(/\.java$/, '') || String(step.number)),
    } : {}),
  }
}
