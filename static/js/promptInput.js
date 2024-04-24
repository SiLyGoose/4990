const updateConfig = {
	minimumTimeBetweenUpdates: 600, // delay between recipe list automatic search
	lastUpdateTimestamp: new Date().getTime(),
	hasChanged: false, // whether search input has been modified
};

// helper function
const createElWithClass = (tagName, ...tokens) => {
	const el = document.createElement(tagName);
	tokens.forEach((token) => el.classList.add(token));
	return el;
};

document.addEventListener("DOMContentLoaded", function () {
	const promptContainer = document.querySelector(".promptContainer"),
		promptWrapper = document.querySelector(".promptWrapper"),
		promptQuestion = document.querySelector(".promptQuestion"),
		promptQuery = document.getElementById("promptQuery");

	const decisionContainer = document.querySelector(".decisionContainer"),
		inputContainer = document.querySelector(".inputContainer"),
		buttonContainer = document.querySelector(".buttonContainer");

	const buttonSubmit = document.querySelector(".buttonSubmit");

	/**
	 * Event listeners must be reattached wih every click because they are
	 * discarded after each webpage refresh.
	 * 
	 * TODO: only replace the text/image in promptContainer 
	 */
	const attachButtonEventListeners = () => {
		const buttonPrev = promptContainer.querySelector(".buttonPrev"),
			buttonNext = promptContainer.querySelector(".buttonNext");

		buttonPrev.addEventListener("click", function (event) {
			prevPromptResponse();
		});

		buttonNext.addEventListener("click", function (event) {
			nextPromptResponse();
		});
	};

	const nextPromptResponse = () => {
		fetch("/simulate_next")
			.then((response) => response.text())
			.then((data) => {
				const tempContainer = document.createElement("div");
				tempContainer.innerHTML = data;

				const tempPromptContainer = tempContainer.querySelector(".promptContainer");
				promptContainer.innerHTML = tempPromptContainer.innerHTML;

				promptContainer.classList.add("generated");
			})
			.finally(attachButtonEventListeners);
	};

	const prevPromptResponse = () => {
		fetch("/simulate_prev")
			.then((response) => response.text())
			.then((data) => {
				const tempContainer = document.createElement("div");
				tempContainer.innerHTML = data;

				const tempPromptContainer = tempContainer.querySelector(".promptContainer");
				promptContainer.innerHTML = tempPromptContainer.innerHTML;

				promptContainer.classList.add("generated");
			})
			.finally(attachButtonEventListeners);
	};

	// handles user finished anwering prompt questions
	const postPromptResponse = () => {
		const createLoadingDiv = () => {
			const faceContainer = createElWithClass("div", "faceContainer"),
				faceWrapper = createElWithClass("div", "faceWrapper"),
				face = createElWithClass("div", "face"),
				eye = createElWithClass("div", "eye"),
				eyeR = createElWithClass("div", "eye", "right"),
				mouth = createElWithClass("div", "mouth");

			[eye, eyeR, mouth].forEach((el) => face.appendChild(el));

			faceWrapper.appendChild(face);

			faceContainer.appendChild(faceWrapper);

			return faceContainer;
		};

		// show loading screen
		promptQuestion.innerHTML = "Please be patient while outfits are being generated. This may take a while.";
		inputContainer.style.display = "none";
		buttonContainer.style.display = "none";

		const loadingDiv = createLoadingDiv();

		promptWrapper.appendChild(loadingDiv);

		// wait for text/image response from openai/dall-e
		fetch("/simulate")
			.then((response) => response.text())
			.then((data) => {
				// remove loading container
				promptWrapper.removeChild(loadingDiv);

				console.log(data);
				buttonContainer.style.display = "block";

				// update webpage with response
				promptContainer.classList.add("generated");

				const tempContainer = document.createElement("div");
				tempContainer.innerHTML = data;

				const tempPromptContainer = tempContainer.querySelector(".promptContainer");
				promptContainer.innerHTML = tempPromptContainer.innerHTML;
			})
			// reattach event listeners
			.finally(attachButtonEventListeners);
	};

	const appendPromptQuery = () => {
		// appends prompt data to chatgpt query
		fetch(`/gather?promptResponse=${promptQuery.value}`)
			.then((response) => response.text())
			.then((data) => {
				const tempContainer = document.createElement("div");
				tempContainer.innerHTML = data;

				// update list of appended queries
				const tempDecisionContainer = tempContainer.querySelector(".decisionContainer");
				decisionContainer.innerHTML = tempDecisionContainer.innerHTML;

				// show next question
				const tempPromptQuestion = tempContainer.querySelector(".promptQuestion");
				if (tempPromptQuestion.textContent === "None") postPromptResponse();
				else promptQuestion.innerHTML = tempPromptQuestion.innerHTML;
			})
			.finally(() => {
				promptQuery.value = "";
			});
	};

	// listens for either "Enter" keypress or "Submit" button click to send data
	promptQuery.addEventListener("keydown", function (event) {
		if (event.key == "Enter") appendPromptQuery();
	});

	buttonSubmit.addEventListener("click", function (event) {
		appendPromptQuery();
	});

	// click to go back to selected prompt
	// decisionWrapper.forEach((node, index) => {
	// 	node.addEventListener("click", function (event) {
	// 		// pass index of element (index is based off nth-child of parent)
	// 		fetch(`/backtrack?promptIndex=${index}`)
	// 			.then((response) => response.text())
	// 			.then((data) => {
	// 				const tempContainer = document.createElement("div");
	// 				tempContainer.innerHTML = data;
	// 			});
	// 	});
	// });

	// reset page/data
	// fetch(`/reset`)
	// 	.then((response) => response.text())
	// 	.then((data) => {
	// 		const tempContainer = document.createElement("div");
	// 		tempContainer.innerHTML = data;

	// 		const tempDecisionContainer = tempContainer.querySelector(".decisionContainer");
	// 		decisionContainer.innerHTML = tempDecisionContainer.innerHTML;

	// 		const tempPromptQuestion = tempContainer.querySelector(".promptQuestion");
	// 		promptQuestion.innerHTML = tempPromptQuestion.innerHTML;

	// 		if (promptQuestion.innerHTML === "None") postPromptResponse();
	// 	})
	// 	.finally(() => {
	// 		promptQuery.value = "";
	// 	});
});
