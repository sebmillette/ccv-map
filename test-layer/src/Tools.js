export const Tools = {
    saveAsJSON({ json, fileName }) {
        const str = JSON.stringify(json);
        const data = str;

        const blob = new Blob([data], {
            type: 'application/octet-stream',
        });

        Tools.downloadFile({ file: blob, fileName });
    },

    /**
     * @props {Object} {file, filename} - filename with extension
     */
    downloadFile(props) {
        const fileURL = URL.createObjectURL(props.file);
        const downloadLink = document.createElement('a');
        downloadLink.href = fileURL;
        downloadLink.download = props.fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    },
};
