import { obterExecutor } from "../lib/db";
import { montarSintese } from "../lib/relatorio";

const exec = await obterExecutor();
const sintese = await montarSintese(exec);
process.stdout.write(`${JSON.stringify(sintese, null, 2)}\n`);
