import { useState, useEffect } from "react";
import {
	darkThemeClass,
	lightThemeClass,
	themeToggleClass,
} from "./styles.css";

const themeKey = `theme`;

const themes = {
	default: { class: lightThemeClass, label: `🌞` },
	dark: { class: darkThemeClass, label: `🌛` },
};

function getInitialTheme() {
	try {
		const localStorageTheme = localStorage.getItem(themeKey);
		if (!localStorageTheme) {
			if (matchMedia(`(prefers-color-scheme:dark)`).matches) {
				return `dark`;
			} else {
				return `default`;
			}
		} else if (Object.keys(themes).includes(localStorageTheme)) {
			return localStorageTheme;
		} else {
			return `default`;
		}
	} catch (e) {
		return `default`;
	}
}

function setTheme(theme: string) {
	localStorage.setItem(themeKey, theme);
	const initialClass = themes[theme].class;
	document.documentElement.className = initialClass;
}

export function setupInitialTheme() {
	try {
		const initialTheme = getInitialTheme();
		setTheme(initialTheme);
	} catch (e) {}
}

export const ThemeToggle = () => {
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
		setTheme(nextTheme);
		setCurrentTheme(nextTheme);
	};

	return (
		<button onClick={handleSetTheme} className={themeToggleClass}>
			{themes[nextTheme].label}
		</button>
	);
};
