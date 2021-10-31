const axios = require('axios').default;
const config = require('./config.json');
let excel = require('excel4node');
const pool_address = config.pool_pubaddress
const send_stats = config.stats
const apimu = config.api

async function get_epoch() {
    try {
        let response = await axios.get("http://api.idena.io/api/Epoch/Last");
        return response.data.result.epoch - 1
    } catch (error) {
        console.log(error);
        return 0
    }
}
async function check_age(address) {
    try {
        let response = await axios.get(`http://api.idena.io/api/Identity/${address}/Age`);
        if (response.data.result) {
            return response.data.result
        } else {
            return null
		}
    } catch (error) {
        return null
    }
}
async function pool_size() {
    try {
        let response = await axios.get(`https://api.idena.org/api/pool/${pool_address}/delegators?limit=100`);
        if (response.data.result) {
            return response.data.result
        } else {
            return null
		}
    } catch (error) {
        return null
    }
}
async function pool_reward(paddress, epoch) {
    try {
        let response = await axios.get(`http://api.idena.io/api/Epoch/${epoch}/Identity/${paddress}/Rewards`);
        if (response.data.result) {
			return response.data.result
        } else {
            return [{
			"type": "Validation",
			"stake": 0
			}]
		}
    } catch (error) {
		console.log("break");
        return {
			"type": "Validation",
			"stake": 0 
		}
    }
}
async function send_gate(padress, stake_send, apimuk, paddress) {
    try {
let response = await axios({
method: 'post',
url: 'http://127.0.0.1:9009/',
data: {
method: 'dna_sendTransaction',
params: [{
        from: `${padress}`,
        to: `${paddress}`,
        amount: `${stake_send}`
        }],
id: 4,
key: `${apimuk}`
},
headers: { 'content-type': 'application/json' }
})
if (response) {
            return response.data.result
        } else {
            return null
                }

    } catch (error) {
        return null
    }
}
async function createExcel() {
	let epoch = await get_epoch();
	let response_pstat = await axios.get(`http://api.idena.io/api/Epoch/${epoch}/Identity/${pool_address}`);
	let state = await response_pstat.data.result.state;
	let totalValidationReward = await response_pstat.data.result.totalValidationReward;
	let pool_age = await check_age(pool_address);
	let d_pool = await pool_size();
	var workbook = new excel.Workbook();
	var worksheet = workbook.addWorksheet('Sheet 1');
	worksheet.cell(1, 1).string("pool_address");
	worksheet.cell(1, 2).string("pool_stat");
	worksheet.cell(1, 3).string("pool_age");
	worksheet.cell(1, 4).string("pool_Rbalance");
	worksheet.cell(1, 5).string("pool_Rstake");
	worksheet.cell(1, 6).string("pool_RrealBalance");
	if (state !== "Newbie" && state !== "Undefined") {
	worksheet.cell(2, 1).string(`${pool_address}`);
	worksheet.cell(2, 2).string(`${state}`);
	worksheet.cell(2, 3).string(`${pool_age}`);
	worksheet.cell(2, 4).string(parseFloat(totalValidationReward * 80  / 100).toFixed(2));
	worksheet.cell(2, 5).string(parseFloat(totalValidationReward * 20  / 100).toFixed(2));
	worksheet.cell(2, 6).string(parseFloat(totalValidationReward).toFixed(2));
	worksheet.cell(3, 1).string("addr_delegation");
	worksheet.cell(3, 2).string("stat_delegation");
	worksheet.cell(3, 3).string("age_delegation");
	worksheet.cell(3, 4).string("80%_rv_delegation");
	worksheet.cell(3, 5).string("80%_rf_delegation");
	worksheet.cell(3, 6).string("80%_rRf_delegation");
	worksheet.cell(3, 7).string("80%_rIC1_delegation");
	worksheet.cell(3, 8).string("80%_rIC2_delegation");
	worksheet.cell(3, 9).string("80%_rIC3_delegation");
	worksheet.cell(3, 10).string("80%_rIC_all_delegation");
	worksheet.cell(3, 11).string("80%_reward_all_delegation");
	worksheet.cell(3, 12).string("80%_sendTX");
        if (d_pool) {
		d_pool.forEach(async (addr, addr_index) => {
		setTimeout(async function () {
			let menungso = await addr.state;
			let paddress = await addr.address;
			let d_age = await check_age(paddress);
			let cellIndex = addr_index + 4
			if (menungso == "Human" || menungso == "Verified") {
			worksheet.cell(cellIndex, 1).string(`${paddress}`);
			worksheet.cell(cellIndex, 2).string(`${menungso}`);
			worksheet.cell(cellIndex, 3).string(`${d_age}`);
			let stake_all = 0;
			let stake_IC = 0;
			console.log(`Checking : ${menungso} - ${paddress} - ${addr_index + 1} out of ${d_pool.length}`);
			let d_reward = await pool_reward(paddress, epoch);
			//console.log(d_reward);
				d_reward.forEach(async (reward, reward_index) => {
					stake_all += parseFloat(reward.stake);
					if (reward.type == "Invitations") {
						stake_IC += parseFloat(reward.stake);
					} else if (reward.type == "Invitations2") {
						stake_IC += parseFloat(reward.stake);
					} else if (reward.type == "Invitations3") {
						stake_IC += parseFloat(reward.stake);
					} else {
//						console.log("");
					}
				setTimeout(async function () {
					let stake = await parseFloat(reward.stake);
					let typeV = await reward.type;
					if (typeV == "Validation") {
					worksheet.cell(cellIndex, 4).string((parseFloat((stake / 20 ) * 80) * 80 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Flips") {
					worksheet.cell(cellIndex, 5).string((parseFloat((stake / 20 ) * 80) * 80 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Reports") {
					worksheet.cell(cellIndex, 6).string((parseFloat((stake / 20 ) * 80) * 80 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations") {
					worksheet.cell(cellIndex, 7).string((parseFloat((stake / 20 ) * 80) * 80 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations2") {
					worksheet.cell(cellIndex, 8).string((parseFloat((stake / 20 ) * 80) * 80 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations3") {
					worksheet.cell(cellIndex, 9).string((parseFloat((stake / 20 ) * 80) * 80 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else {
//					console.log(`${typeV} - no reward`);
					}
					workbook.write('excel3.xlsx');
					}, 500 * reward_index);
				});
				worksheet.cell(cellIndex, 10).string((parseFloat((stake_IC / 20 ) * 80) * 80 / 100).toFixed(2));
				worksheet.cell(cellIndex, 11).string((parseFloat((stake_all / 20 ) * 80) * 80 /100).toFixed(2));
				if (send_stats == true) {
					let stake_send = ((parseFloat((stake_all / 20 ) * 80) * 80 /100).toFixed(2));
					let padress = pool_address
					let apimuk = apimu
					let reqpass = await send_gate(padress, stake_send, apimuk, paddress);
					worksheet.cell(cellIndex, 12).string(`${reqpass}`);
					console.log(`Sending ${stake_send} IDNA - TX = ${reqpass}`)
				} else {
					console.log("-----------");
				}
			} else if (menungso == "Newbie") {
			worksheet.cell(cellIndex, 1).string(`${paddress}`);
			worksheet.cell(cellIndex, 2).string(`${menungso}`);
			worksheet.cell(cellIndex, 3).string(`${d_age}`);
			let stake_all = 0;
			let stake_IC = 0;
			console.log(`Checking : ${menungso} - ${paddress} - ${addr_index + 1} out of ${d_pool.length}`);
			let d_reward = await pool_reward(paddress, epoch);
			//console.log(d_reward);
				d_reward.forEach(async (reward, reward_index) => {
					stake_all += parseFloat(reward.stake);
					if (reward.type == "Invitations") {
						stake_IC += parseFloat(reward.stake);
					} else if (reward.type == "Invitations2") {
						stake_IC += parseFloat(reward.stake);
					} else if (reward.type == "Invitations3") {
						stake_IC += parseFloat(reward.stake);
					} else {
//						console.log("");
					}
				setTimeout(async function () {
					let stake = await parseFloat(reward.stake);
					let typeV = await reward.type;
					if (typeV == "Validation") {
					worksheet.cell(cellIndex, 4).string((parseFloat((stake / 80 ) * 20) * 90 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Flips") {
					worksheet.cell(cellIndex, 5).string((parseFloat((stake / 80 ) * 20) * 90 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Reports") {
					worksheet.cell(cellIndex, 6).string((parseFloat((stake / 80 ) * 20) * 90 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations") {
					worksheet.cell(cellIndex, 7).string((parseFloat((stake / 80 ) * 20) * 90 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations2") {
					worksheet.cell(cellIndex, 8).string((parseFloat((stake / 80 ) * 20) * 90 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations3") {
					worksheet.cell(cellIndex, 9).string((parseFloat((stake / 80 ) * 20) * 90 / 100).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else {
//					console.log(`${typeV} - no reward`);
					}
					workbook.write('excel3.xlsx');
					}, 500 * reward_index);
				});
				worksheet.cell(cellIndex, 10).string((parseFloat((stake_IC / 80 ) * 20) * 90 / 100).toFixed(2));
				worksheet.cell(cellIndex, 11).string((parseFloat((stake_all / 80 ) * 20) * 90 /100).toFixed(2));
				
				if (send_stats == true) {
					let stake_send = ((parseFloat((stake_all / 80 ) * 20) * 90 /100).toFixed(2));
					let padress = pool_address
					let apimuk = apimu
					let reqpass = await send_gate(padress, stake_send, apimuk, paddress);
					worksheet.cell(cellIndex, 12).string(`${reqpass}`);
					console.log(`Sending ${stake_send} IDNA - TX = ${reqpass}`)
				} else {
					console.log("-----------");
				}
			} else {
			console.log(`${menungso} - ${paddress} no count`);
			worksheet.cell(cellIndex, 1).string(`${paddress}`);
			worksheet.cell(cellIndex, 2).string(`${menungso}`);
			worksheet.cell(cellIndex, 3).string(`${d_age}`);
			worksheet.cell(cellIndex, 4).string("no count");
			}
		workbook.write('excel3.xlsx');
		},1200 * addr_index);
	});
        } else {
            console.log("no pool address");
		}
	} else if (state == "Undefined") {
	worksheet.cell(2, 1).string(`${pool_address}`);
	worksheet.cell(2, 2).string(`${state}`);
	worksheet.cell(2, 3).string(`${pool_age}`);
	worksheet.cell(2, 4).string(parseFloat(totalValidationReward).toFixed(2));
	worksheet.cell(3, 1).string("addr_delegation");
	worksheet.cell(3, 2).string("stat_delegation");
	worksheet.cell(3, 3).string("age_delegation");
	worksheet.cell(3, 4).string("rv_delegation");
	worksheet.cell(3, 5).string("rf_delegation");
	worksheet.cell(3, 6).string("rRf_delegation");
	worksheet.cell(3, 7).string("rIC1_delegation");
	worksheet.cell(3, 8).string("rIC2_delegation");
	worksheet.cell(3, 9).string("rIC3_delegation");
	worksheet.cell(3, 10).string("rIC_all_delegation");
	worksheet.cell(3, 11).string("reward_all_delegation");
	worksheet.cell(3, 12).string("SendTX");
        if (d_pool) {
		d_pool.forEach(async (addr, addr_index) => {
		setTimeout(async function () {
			let menungso = await addr.state;
			let paddress = await addr.address;
			let d_age = await check_age(paddress);
			let cellIndex = addr_index + 4
			if (menungso == "Human" || menungso == "Verified") {
			worksheet.cell(cellIndex, 1).string(`${paddress}`);
			worksheet.cell(cellIndex, 2).string(`${menungso}`);
			worksheet.cell(cellIndex, 3).string(`${d_age}`);
			let stake_all = 0;
			let stake_IC = 0;
			console.log(`Checking : ${menungso} - ${paddress} - ${addr_index + 1} out of ${d_pool.length}`);
			let d_reward = await pool_reward(paddress, epoch);
				d_reward.forEach(async (reward, reward_index) => {
					stake_all += parseFloat(reward.stake);
					if (reward.type == "Invitations") {
						stake_IC += parseFloat(reward.stake);
					} else if (reward.type == "Invitations2") {
						stake_IC += parseFloat(reward.stake);
					} else if (reward.type == "Invitations3") {
						stake_IC += parseFloat(reward.stake);
					} else {
//						console.log("");
					}
				setTimeout(async function () {
					let stake = await parseFloat(reward.stake);
					let typeV = await reward.type;
					if (typeV == "Validation") {
					worksheet.cell(cellIndex, 4).string((parseFloat(stake / 20 ) * 80).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Flips") {
					worksheet.cell(cellIndex, 5).string((parseFloat(stake / 20 ) * 80).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Reports") {
					worksheet.cell(cellIndex, 6).string((parseFloat(stake / 20 ) * 80).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations") {
					worksheet.cell(cellIndex, 7).string((parseFloat(stake / 20 ) * 80).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations2") {
					worksheet.cell(cellIndex, 8).string((parseFloat(stake / 20 ) * 80).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations3") {
					worksheet.cell(cellIndex, 9).string((parseFloat(stake / 20 ) * 80).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else {
					console.log(`${typeV} - no reward`);
					}
					workbook.write('excel3.xlsx');
					}, 500 * reward_index);
				});
				worksheet.cell(cellIndex, 10).string((parseFloat(stake_IC / 20 ) * 80).toFixed(2));
				worksheet.cell(cellIndex, 11).string((parseFloat(stake_all / 20 ) * 80).toFixed(2));
				
				if (send_stats == true) {
					let stake_send = ((parseFloat(stake_all / 20 ) * 80).toFixed(2));
					let padress = pool_address
					let apimuk = apimu
					let reqpass = await send_gate(padress, stake_send, apimuk, paddress);
					worksheet.cell(cellIndex, 12).string(`${reqpass}`);
					console.log(`Sending ${stake_send} IDNA - TX = ${reqpass}`)
				} else {
					console.log("-----------");
				}
			} else if (menungso == "Newbie") {
			worksheet.cell(cellIndex, 1).string(`${paddress}`);
			worksheet.cell(cellIndex, 2).string(`${menungso}`);
			worksheet.cell(cellIndex, 3).string(`${d_age}`);
			let stake_all = 0;
			let stake_IC = 0;
			console.log(`Checking : ${menungso} - ${paddress} - ${addr_index + 1} out of ${d_pool.length}`);
			let d_reward = await pool_reward(paddress, epoch);
			//console.log(d_reward);
				d_reward.forEach(async (reward, reward_index) => {
					stake_all += parseFloat(reward.stake);
					if (reward.type == "Invitations") {
						stake_IC += parseFloat(reward.stake);
					} else if (reward.type == "Invitations2") {
						stake_IC += parseFloat(reward.stake);
					} else if (reward.type == "Invitations3") {
						stake_IC += parseFloat(reward.stake);
					} else {
//						console.log("");
					}
				setTimeout(async function () {
					let stake = await parseFloat(reward.stake);
					let typeV = await reward.type;
					if (typeV == "Validation") {
					worksheet.cell(cellIndex, 4).string((parseFloat(stake / 80) * 20).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Flips") {
					worksheet.cell(cellIndex, 5).string((parseFloat(stake / 80) * 20).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Reports") {
					worksheet.cell(cellIndex, 6).string((parseFloat(stake / 80) * 20).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations") {
					worksheet.cell(cellIndex, 7).string((parseFloat(stake / 80) * 20).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations2") {
					worksheet.cell(cellIndex, 8).string((parseFloat(stake / 80) * 20).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else if (typeV == "Invitations3") {
					worksheet.cell(cellIndex, 9).string((parseFloat(stake / 80) * 20).toFixed(2));
//					console.log(`######################################${typeV} - stake ${stake}`);
					} else {
//					console.log(`${typeV} - no reward`);
					}
					workbook.write('excel3.xlsx');
					}, 500 * reward_index);
				});
				worksheet.cell(cellIndex, 10).string((parseFloat(stake_IC / 80) * 20).toFixed(2));
				worksheet.cell(cellIndex, 11).string((parseFloat(stake_all / 80 ) * 20).toFixed(2));
				
				if (send_stats == true) {
					let stake_send = ((parseFloat(stake_all / 80 ) * 20).toFixed(2));
					let padress = pool_address
					let apimuk = apimu
					let reqpass = await send_gate(padress, stake_send, apimuk, paddress);
					worksheet.cell(cellIndex, 12).string(`${reqpass}`);
					console.log(`Sending ${stake_send} IDNA - TX = ${reqpass}`)
				} else {
					console.log("-----------");
				}
			} else {
			console.log(`${menungso} - ${paddress} no count`);
			}
		workbook.write('excel3.xlsx');
		},1200 * addr_index);
	});
        } else {
            console.log("no pool address");
			worksheet.cell(cellIndex, 1).string(`${paddress}`);
			worksheet.cell(cellIndex, 2).string(`${menungso}`);
			worksheet.cell(cellIndex, 3).string(`${d_age}`);
			worksheet.cell(cellIndex, 4).string("no count");
		}
	} else {
		console.log("Newbie not compatible")
	}
}
createExcel();
