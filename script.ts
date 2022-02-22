interface Choice {
	title: string,
	description: string,
	type: string,
	provides?: string,
	requires?: string,
}

interface NumberChoice extends Choice {
	type: "number",
	default: number,
	code: string,
};

interface RadioChoice extends Choice {
	type: "radio",
	options: {
		name: string,
		code: string,
		enabled?: boolean,
	}[],
};

type ChoiceType = NumberChoice | RadioChoice;

interface Data {
	choices: ChoiceType[],
}

async function getJson(url) {
	const resp = await fetch(url);
	return resp.json();
}

let data: Data;

async function init() {
	data = await getJson("data.json");
	const form = document.getElementById("form");
	data.choices.forEach((choice, choice_idx) => {
		const choice_div = document.createElement("div");
		choice_div.className = "choice";

		const title = document.createElement("span");
		title.className = "title";
		title.textContent = choice.title;
		choice_div.append(title);

		const description = document.createElement("span");
		description.className = "description";
		description.innerHTML = choice.description;
		choice_div.append(description);

		if (choice.type == "number") {
				const input = document.createElement("input");
				input.type = "number";
				input.id = choice_idx.toString();
				input.name = choice_idx.toString();
				input.value = choice.default.toString();
				input.addEventListener("input", update);
				choice_div.append(input);

		} else if (choice.type == "radio") {
			choice.options.forEach((option, option_idx) => {
				const option_div = document.createElement("div");
				option_div.className = "option";

				const option_id = `${choice_idx}:${option_idx}`;

				const input = document.createElement("input");
				input.type = "radio";
				input.id = option_id;
				input.name = choice_idx.toString();
				input.value = option_idx.toString();
				if (option_idx == 0) {
					input.checked = true;
				}
				input.addEventListener("input", update);
				option_div.append(input);

				const label = document.createElement("label");
				label.textContent = option.name;
				label.htmlFor = option_id;
				option_div.append(label);

				choice_div.append(option_div);
			});
		}

		form.append(choice_div);
	});
	update();
}

function update() {
	const out = document.getElementById("out");
	let value = "";
	const features = new Map<string, boolean>();

	data.choices.forEach((choice, choice_idx) => {
		let disabled = false;
		if (choice.requires && !features.get(choice.requires)) {
			disabled = true;
		}
		document.querySelectorAll(`input[name="${choice_idx}"]`).forEach(e => {
			(e as HTMLInputElement).disabled = disabled;
		});
		if (disabled) {
			return;
		}

		if (choice.type == "number") {
			const input = document.querySelector(`input[name="${choice_idx}"]`) as HTMLInputElement;
			value += choice.code.replace(/{}/g, input.value);
			value += "\n\n";

		} else if (choice.type == "radio") {
			const selected_input = document.querySelector(`input[name="${choice_idx}"]:checked`) as HTMLInputElement;
			const chosen_option = choice.options[parseInt(selected_input.value)];
			if (chosen_option.code != null) {
				value += `# ${chosen_option.name}\n${chosen_option.code}\n\n`;
			}

			if (choice.provides) {
				features.set(choice.provides, chosen_option.enabled);
			}
		}
	});

	out.textContent = value;
}

function select_out() {
	const out = document.getElementById("out");
	const selection = window.getSelection();
	selection.selectAllChildren(out);
}
