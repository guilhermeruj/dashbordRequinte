
const moment = require("moment");

function dateAjuste(pegadata){
moment
.tz(pegadata, "YYYY-MM-DD HH:mm:ss", "America/Sao_Paulo")
.toDate();
}
module.exports = dateAjuste;