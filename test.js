const findValue = (obj, key) => {
  if (typeof obj !== "object" || obj === null) return null;
  if (key in obj) return String(obj[key]);
  for (const k of Object.keys(obj)) {
    const val = findValue(obj[k], key);
    if (val) return val;
  }
  return null;
};

const xmlParsed = {
  mensagemTISS: {
     prestadorParaOperadora: {
         loteGuias: {
             guiasTISS: {
                 "guiaSP-SADT": {
                     procedimentosExecutados: {
                         procedimentoExecutado: {
                             valorTotal: 350.00
                         }
                     },
                     valorTotal: {
                         valorProcedimentos: 350.00,
                         valorDiarias: 0.00,
                         valorTotalGeral: 350.00
                     }
                 }
             }
         }
     }
  }
};

console.log(findValue(xmlParsed, "valorTotal"));
