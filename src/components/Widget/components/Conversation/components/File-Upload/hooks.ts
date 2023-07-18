import 'idempotent-babel-polyfill';
import { useCallback, useState } from 'react';

const validateUploadFiles = async (files: FileList | null): Promise<TFile[]> => {
	if (!files) {
		return [];
	}
	const result: TFile[] = []
	await [...files].reduce(async (promise, file) => {
		await promise;
		const reader = new FileReader();
		reader.readAsDataURL(file);
		return new Promise((resolve) => {
			reader.onload = function () {
				result.push({
					source: reader.result as string,
					file,
				});
				resolve();
			};
		});
	}, Promise.resolve());
	return result;
};

type TUseUploadFilesReturn = [
	TFile[],
	(event: { target: HTMLInputElement; }) => void,
	(index: number) => void,
	(blob: Blob) => void,
];

export type TFile = {
	source?: string;
	file?: File;
}

export const useUploadFiles = (): TUseUploadFilesReturn => {
	const [files, setFiles] = useState<TFile[]>([]);
	
	const selectFilesWrapper = useCallback((event: { target: HTMLInputElement; }) => {
		(async () => {
			const uploadFiles = await validateUploadFiles(event.target.files);
			setFiles(uploadFiles);
		})();
	}, []);
	const deleteFile = useCallback((index: number) => {
		files.splice(index, 1);
		setFiles([...files]);
	}, [files]);
	const handleBlob = useCallback((blob: Blob) => {
		(async () => {
			let day = new Date()
			let time = new Date().getTime()
			let file = new File([blob], `${day.toDateString().replaceAll(' ', '_') + time}.mp4`, { type: "video/mp4", lastModified: new Date().getTime() });
			let container = new DataTransfer();
			container.items.add(file);
			const uploadFiles = await validateUploadFiles(container.files);
			setFiles([...uploadFiles])
		})();
	}, [])
	
	return [files, selectFilesWrapper, deleteFile, handleBlob];
};
