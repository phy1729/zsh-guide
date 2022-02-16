interface Choice {
	title: string,
	description?: string,
	type: string,
}

interface RadioChoice extends Choice {
	type: "radio",
	options: {
		name: string,
		code: string,
	}[],
};

type ChoiceType = RadioChoice;

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

		if (choice.type == "radio") {
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

	data.choices.forEach((choice, choice_idx) => {
		if (choice.type == "radio") {
			const selected_input = document.querySelector(`input[name="${choice_idx}"]:checked`) as HTMLInputElement;
			const chosen_option = choice.options[parseInt(selected_input.value)];
			if (chosen_option.code != null) {
				value += chosen_option.code;
				value += "\n";
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
