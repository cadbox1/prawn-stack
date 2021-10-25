import { useState, useEffect } from "react";
import { themeToggleClass } from "./styles.css";

const themeKey = `theme`;

function setTheme(themes, theme: string) {
	localStorage.setItem(themeKey, theme);
	const initialClass = themes[theme].class;
	document.documentElement.className = initialClass;
}

function getInlineScript(themes) {
	return `

(function() {
	
	const themeKey = "theme";
	
	function getInitialTheme(themes) {
		try {
			const localStorageTheme = localStorage.getItem(themeKey);
			if (!localStorageTheme) {
				if (matchMedia("(prefers-color-scheme:dark)").matches) {
					return "dark";
				} else {
					return "default";
				}
			} else if (Object.keys(themes).includes(localStorageTheme)) {
				return localStorageTheme;
			} else {
				return "default";
			}
		} catch (e) {
			return "default";
		}
	}
	
	function setTheme(themes, theme) {
		localStorage.setItem(themeKey, theme);
		const initialClass = themes[theme].class;
		document.documentElement.className = initialClass;
	}
	
	function setupInitialTheme(themes) {
		try {
			const initialTheme = getInitialTheme(themes);
			setTheme(themes, initialTheme);
		} catch (e) {}
	}

	setupInitialTheme(${JSON.stringify(themes)})

})()`;
}

export const InitialiseTheme = ({ themes }) => {
	return (
		<script
			dangerouslySetInnerHTML={{ __html: getInlineScript(themes) }}
		></script>
	);
};

export const ThemeToggle = ({ themes }) => {
	const [currentTheme, setCurrentTheme] = useState(`default`);

	useEffect(() => {
		setCurrentTheme(
			Object.keys(themes).find(
				(key) => themes[key].class === document.documentElement.className
			)
		);
	});

	const keys = Object.keys(themes);
	const nextTheme = keys[(keys.indexOf(currentTheme) + 1) % keys.length];

	const handleSetTheme = () => {
		setTheme(themes, nextTheme);
		setCurrentTheme(nextTheme);
	};

	return (
		<button onClick={handleSetTheme} className={themeToggleClass}>
			{themes[nextTheme].label}
		</button>
	);
};
