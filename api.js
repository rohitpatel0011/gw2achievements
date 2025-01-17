const { createCanvas, loadImage, registerFont } = require('canvas');
const { createServer } = require('http');
const { themes } = require('./js/options.js');

registerFont('font/trebuc.ttf', { family: 'Trebuchet MS' });
registerFont('font/trebucbd.ttf', { family: 'Trebuchet MS', weight: 'bold' });

const defaultOptions = {
	state: 'in_progress',  // "in_progress" | "completed"
	theme: 'general',  // "general" | "wvw" | "pvp" | "legendary_bag" | "legendary_weapon" | "community" | "festival" | "dragons_stand"
	title: "Achievement's title",

	// requires "in_progress"
	progress: 1,
	goal: 11,
	ap: 2
};

const defaultLanguage = 'en';
const dpr = 2;
const width = 318;
const height = 90;

const languages = {
	en: 'Completed',
	fr: 'Terminé',
	de: 'Abgeschlossen',
	es: 'Completado'
};

const images = {};
const mimes = {
	'png': 'image/png',
	'jpg': 'image/jpeg',
	'jpeg': 'image/jpeg',
};

const logStyleReset = "\x1b[0m";
//const logStyleUnderscore = "\x1b[4m";

//const logStyleFgBlack = "\x1b[30m";
const logStyleFgRed = "\x1b[31m";
const logStyleFgGreen = "\x1b[32m";
const logStyleFgYellow = "\x1b[33m";
//const logStyleFgBlue = "\x1b[34m";
const logStyleFgMagenta = "\x1b[35m";
//const logStyleFgCyan = "\x1b[36m";
//const logStyleFgWhite = "\x1b[37m";

//const logStyleBgBlack = "\x1b[40m";
//const logStyleBgRed = "\x1b[41m";
//const logStyleBgGreen = "\x1b[42m";
//const logStyleBgYellow = "\x1b[43m";
const logStyleBgBlue = "\x1b[44m";
//const logStyleBgMagenta = "\x1b[45m";
//const logStyleBgCyan = "\x1b[46m";
//const logStyleBgWhite = "\x1b[47m";

const parse = (request) => {
	const { pathname, searchParams } = new URL(request.url, `http://${request.headers.host}`);;
	const match = decodeURIComponent(pathname).match(/^\/(.+)\.([\w\d]+)$/);
	if (!match) {
		return false;
	}
	const [, title, ext] = match;
	if (!Object.keys(mimes).includes(ext)) {
		return false;
	}
	const state = searchParams.get('state') || searchParams.get('s') || 'in_progress';  // "in_progress" | "completed"
	const theme = searchParams.get('theme') || searchParams.get('t') || 'general';  // "general" | "wvw" | "pvp" | "legendary_bag" | "legendary_weapon" | "community" | "festival" | "dragons_stand"
	const icon = searchParams.get('icon') || searchParams.get('i') || '2261498';
	const language = searchParams.get('language') || searchParams.get('l') || defaultLanguage;
	const options = {
		title, ext, state, theme, icon,
		language: language in languages ? language : defaultLanguage
	};
	if (state === 'in_progress') {
		const rewards = searchParams.get('rewards') || searchParams.get('r');
		Object.assign(options, {
			progress: searchParams.get('progress') || searchParams.get('p'),
			goal: searchParams.get('goal') || searchParams.get('g'),
			tier: searchParams.get('tier') || searchParams.get('tr'),
			ap: searchParams.get('ap'),
			rewards: rewards && rewards.split(','),
		})
	}
	return options;
}

const styleImage = (img, style, operation = 'overlay') => {
	const width = img.width || img.naturalWidth;
	const height = img.height || img.naturalHeight;
	const c = createCanvas(width, height);
	const x = c.getContext('2d');
	x.drawImage(img, 0, 0, width, height);
	x.globalCompositeOperation = operation;
	x.fillStyle = style;
	x.fillRect(0, 0, width, height);
	return c;
};

const draw = async (options) => {

	const canvas = createCanvas(width, height);
	canvas.width = width * dpr;
	canvas.height = height * dpr;
	const ctx = canvas.getContext('2d');
	ctx.scale(dpr, dpr);

	const theme = themes[options.theme];

	ctx.font = '14px "Trebuchet MS", Helvetica, sans-serif';

	// background
	ctx.drawImage(images.background, 292, 287, width, height, 0, 0, width, height);

	switch (options.state) {
		case 'completed':

			// background
			ctx.save();
			ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
			ctx.fillRect(0, 0, width, height);
			ctx.restore();

			ctx.save();
			// draw color
			//ctx.fillStyle = theme.background;
			//ctx.fillRect(0, 0, canvas.width, canvas.height);

			// set composite mode
			//ctx.globalCompositeOperation = "destination-in";

			// draw image
			//ctx.drawImage(await loadImage('img/605007.png'), 0, 0, canvas.width, canvas.height);
			ctx.drawImage(styleImage(images.gradient, theme.background, 'source-in'), 0, 0, width, height);

			// fill background
			/*ctx.globalCompositeOperation = "destination-over";
			ctx.fillStyle = 'rgba(26, 26, 26, 0.8)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);*/
			ctx.restore();

			// gradient
			ctx.save();
			const gradient = ctx.createRadialGradient(56, 40, 0, 56, 40, 100);
			gradient.addColorStop(0, theme.background);
			gradient.addColorStop(1, 'rgba(26,26,26,0)');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, width, height);
			ctx.restore();

			// stars
			ctx.save();
			ctx.globalAlpha = 0.6;
			ctx.drawImage(images.star1, -39, -34, 158, 158);
			ctx.drawImage(images.star2, -39, -34, 158, 158);
			ctx.restore();

			// icon
			ctx.drawImage(await loadImage(`img/icons/${options.icon}.png`), 13, 13);

			// completed
			ctx.save();
			ctx.fillStyle = theme.color;
			ctx.fillText(languages[options.language], 108, 62);
			ctx.restore();

			// border
			ctx.save();
			const borderImage = images.border;
			const f = height / borderImage.height;
			const dx = 12;
			ctx.drawImage(borderImage, 0, 0, dx, borderImage.height, 0, 0, dx * f, height);
			ctx.drawImage(borderImage, borderImage.width - dx, 0, dx, borderImage.height, width - dx * f, 0, dx * f, height);
			ctx.drawImage(borderImage, dx, 0, borderImage.width - 2 * dx, borderImage.height, dx * f, 0, width - 2 * dx * f, height);
			ctx.restore();

			break;

		case 'in_progress':

			//background
			ctx.save();
			ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
			ctx.fillRect(0, 0, width, height);
			ctx.restore();

			// icon
			ctx.save();
			ctx.globalAlpha = 0.6;
			ctx.drawImage(await loadImage(`img/icons/${options.icon}.png`), 13, 13);
			ctx.restore();

			// progress
			ctx.save();
			ctx.globalCompositeOperation = "lighter";
			ctx.drawImage(styleImage(images.progress, theme.background), 0, 90 * (1 - options.progress / options.goal), 90, 90);
			ctx.restore();

			// border
			ctx.save();
			ctx.drawImage(images.border, 0, 0, 90, 90);
			ctx.restore();

			if (options.tier && options.tier !== '0') {
				ctx.drawImage(images.tier, 10 + 64 * ((options.tier - 1) % 8), options.tier > 8 ? 64 : 0, 44, 22, 31, 0, 28, 14);
			}

			// count
			ctx.save();
			ctx.shadowBlur = 1;
			ctx.shadowColor = 'rgb(0, 0, 0)';
			ctx.fillStyle = 'White';
			ctx.textAlign = 'center';
			ctx.fillText(`${options.progress}/${options.goal}`, 45, 85);
			ctx.restore();

			// bottom background
			ctx.save();
			ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
			ctx.fillRect(90, 58, width - 90, 32);
			ctx.restore();

			ctx.drawImage(await loadImage('img/605011.png'), width - 32, height - 32);
			ctx.drawImage(images.eye, width - 32, height - 32);

			let dxReward = 118;

			if (options.ap && options.ap !== '0') {
				ctx.save();
				ctx.shadowBlur = 2;
				ctx.shadowColor = 'rgb(0, 0, 0)';
				ctx.font = 'normal normal bold 15px "Trebuchet MS", Helvetica, sans-serif';
				ctx.fillStyle = 'rgb(136, 136, 85)';
				ctx.fillText(options.ap, 109, 77);
				dxReward = 109 + ctx.measureText(options.ap).width;
				ctx.restore();

				ctx.save();
				ctx.drawImage(images.ap, dxReward, 56);
				dxReward += 43;
				ctx.restore();
			}

			if (options.rewards) {
				if (options.rewards.indexOf('title') != -1) {
					ctx.save();
					ctx.drawImage(images.title, dxReward, 56);
					dxReward += 32;
					ctx.restore();
				}
				if (options.rewards.indexOf('tyria') != -1) {
					ctx.save();
					ctx.drawImage(images.tyria, dxReward, 56);
					dxReward += 40;
					ctx.restore();
				}
				if (options.rewards.indexOf('maguuma') != -1) {
					ctx.save();
					ctx.drawImage(images.maguuma, dxReward, 56);
					dxReward += 40;
					ctx.restore();
				}
				if (options.rewards.indexOf('desert') != -1) {
					ctx.save();
					ctx.drawImage(images.desert, dxReward, 56);
					dxReward += 40;
					ctx.restore();
				}
				if (options.rewards.indexOf('tundra') != -1) {
					ctx.save();
					ctx.drawImage(images.tundra, dxReward, 56);
					dxReward += 40;
					ctx.restore();
				}
			}

			break;
	}

	// title
	ctx.save();
	ctx.shadowBlur = 2;
	ctx.shadowColor = 'rgb(0, 0, 0)';
	ctx.fillStyle = 'White';
	ctx.fillText(options.title, 108, 35);
	ctx.restore();

	//canvas.width = width;
	//canvas.height = height;

	return canvas.toBuffer(mimes[options.ext] || 'image/png');
};

(async () => {
	Object.assign(images, {
		background: await loadImage('img/156000.png'),
		gradient: await loadImage('img/605007.png'),
		star1: await loadImage('img/605008.png'),
		star2: await loadImage('img/605009.png'),
		border: await loadImage('img/605003.png'),
		tier: await loadImage('img/870381.png'),
		progress: await loadImage('img/605002.png'),
		eye: await loadImage('img/605021.png'),
		ap: await loadImage('img/155062.png'),
		title: await loadImage('img/605001.png'),
		tyria: await loadImage('img/962103.png'),
		maguuma: await loadImage('img/962065.png'),
		desert: await loadImage('img/1770231.png'),
		tundra: await loadImage('img/2221463.png'),
	});

	createServer(async (request, response) => {
		const error = {
			code: 500,
			message: 'Internal Server Error'
		};
		try {
			if (request.method !== 'GET') {
				Object.assign(error, {
					code: 405,
					message: 'Method Not Allowed'
				})
				throw new Error('Method Not Allowed');
			}
			const options = parse(request);
			if (!options) {
				response.writeHead(302, {
					'Location': 'https://gw2achievements.com',
					//add other headers here...
				});
			} else {
				response.write(await draw(options));
				response.writeHead(200, {
					'Content-Type': mimes[options.ext] || 'image/png',
				});
			}
			response.end();
		} catch (err) {
			console.error(err);
			response.statusCode = error.code;
			response.statusMessage = error.message;
			response.end();
		} finally {
			let statusColor = logStyleFgGreen;
			if (response.statusCode) {
				statusColor = {
					2: logStyleFgGreen,
					3: logStyleFgYellow,
					4: logStyleFgMagenta,
					5: logStyleFgRed
				}[response.statusCode.toString()[0]];
			}
			console.log(`${logStyleBgBlue}${request.method}${logStyleReset} ${request.url} ${statusColor}${response.statusCode}${logStyleReset}`);
		}
	}).listen(3010);
})();
