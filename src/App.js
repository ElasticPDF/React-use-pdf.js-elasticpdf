import './App.css';

function App() {
	var elasticpdf_viewer = null;
	var is_elasticpdf=false;
	var is_chinese=false;
	if (navigator.language.startsWith('zh')){
		is_chinese=true;
	}
	
	
	function initialPDFEditor() {
		// 监听 pdf 编辑各种信息的回调
		listenPDFEditorMessage();
		elasticpdf_viewer = document.getElementById('elasticpdf-iframe').contentWindow;
		console.log('elasticpdf_viewer', elasticpdf_viewer);
		var pdf_url="compressed.tracemonkey-pldi-09.pdf";
		if (is_elasticpdf){
			pdf_url="tutorial.pdf";
		}

		elasticpdf_viewer.initialApp({
			'language': 'zh-cn', // 交互语言 UI language
			'pdf_url': pdf_url,
			'member_info': { // 用户信息 User Information
				'id': 'elasticpdf_id',
				'name': 'elasticpdf',
			},
		});
		console.log('pdfurl',elasticpdf_viewer.PDFViewerApplication.baseUrl);
	}
	
	
	function listenPDFEditorMessage() {
		window.addEventListener('message', (e) => {
			if (e.data.source !== 'elasticpdf') {
				return;
			}
	
			// 接收pdf数据 receive pdf data
			if (e.data.function_name === 'downloadPDF') {
				let file_name = e.data.content['file_name'];
				let pdf_blob = e.data.content['pdf_blob'];
				let pdf_base64 = e.data.content['pdf_base64'];
				console.log('PDF信息', pdf_base64);
				// 如果文档没有被编辑过，则 pdf_base64 仍然是文件名
				// 接收到 pdf 数据，其中 pdf_base64 可以快捷上传到服务器
				
				// pdf_base64 is still the file name if the document has not been edited
				// Receive pdf data, where pdf_base64 can be quickly uploaded to the server
				postService('upload-pdf-data', {
					'file_name': file_name,
					'file_id': '123ddasfsdffads',
					'file_data': pdf_base64,
				});
			}
	
			// pdf 批注编辑回调，可以在此处导出批注并传输到服务器
			// PDF annotation editing callback, where annotations can be exported and transferred to the server
			if (e.data.function_name === 'annotationsModified') {
				// 仅获取 pdf 批注文件，不写入到 pdf 中
				// Only get the PDF annotation file, do not write it into the PDF
				let this_data = elasticpdf_viewer.pdfAnnotation.outputAnnotations();
				let annotation_content = JSON.stringify(this_data['file_annotation']);
				let file_name = this_data['file_name'];
				console.log('批注信息', annotation_content);
				postService('upload-annotation-data', {
					'file_name': file_name,
					'file_id': '123ddasfsdffads',
					'file_annotation': annotation_content,
				});
			}
	
			// pdf 加载结束的回调，可以在此处导入服务器上储存的批注文件
			// PDF loaded callback, you can import the annotation file stored on the server
			if (e.data.function_name === 'pdfLoaded') {
				console.log('PDF加载成功');
				reloadData();
			}
		});
	}
	
	// 获取pdf数据
	// get pdf data
	function getPDFData() {
		if (is_elasticpdf==false){
			alert('Only available on Elasticpdf');
			return;
		}
		elasticpdf_viewer.getPDFData();
	}
	
	// 打开或者关闭批注列表
	// open or close annotation list
	function openOrCloseAnnotatioList(){
		if (is_elasticpdf==false){
			alert('Only available on Elasticpdf');
			return;
		}
		elasticpdf_viewer.editAnnotation();
	}
	
	
	// 导出可保存的批注对象
	// export annotations data
	function outputAnnotations() {
		if (is_elasticpdf==false){
			alert('Only available on Elasticpdf');
			return;
		}
		var this_data = elasticpdf_viewer.pdfAnnotation.outputAnnotations();
		var content = JSON.stringify(this_data['file_annotation']);
		console.log('导出批注',content);
	}
	
	function changeFile(){
		if (is_elasticpdf==false){
			alert('Only available on Elasticpdf');
			return;
		}
		var test_pdf='https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
		elasticpdf_viewer.pdfAnnotation.refreshFabricState(1);
		elasticpdf_viewer.pdfAnnotation.openFile(test_pdf);
		console.log('pdfurl',elasticpdf_viewer.PDFViewerApplication.baseUrl);
	}
	
	function setUser(){
		if (is_elasticpdf==false){
			alert('Only available on Elasticpdf');
			return;
		}
		var this_member = {
			'id': "test_id",
			'name': 'test_name',
		};
		elasticpdf_viewer.setCurrentMemberId(this_member);
		alert('user-changed');
	}
	
	
	async function reloadData() {
		if (is_elasticpdf==false){
			alert('Only available on Elasticpdf');
			return;
		}
		let file_name = 'tutorial.pdf'
		let annotation_content = await postService('get-annotation-data', {
			'file_name': 'tutorial.pdf',
			'file_id': '123ddasfsdffads',
		});
		if (annotation_content){
			// 批注重载回显于当前文件
			// reload annotations on current file
			elasticpdf_viewer.setPureFileAnnotation({
				'file_annotation': annotation_content
			});
		}
		
	}
	
	
	// 与后端服务器进行网络通信的函数
	// connect server
	async function postService(url, data) {
		return null;
		var new_data = new URLSearchParams();
		var encrpte_data = data;
		new_data.append('data', encrpte_data);
	
		var base_url = "your-server-url";
		var posturl = base_url + url;
		const response = await fetch(posturl, {
			method: 'POST',
			headers: {},
			body: new_data,
		});
	
	
		const resp = await response.json();
		resp['data'] = JSON.parse(resp['data']);
	
		return resp;
	}
	

	  return (
		<div className="App">
		
		{
			is_chinese &&
			<div className='project-title'>
				<img src="react-static/react.png" alt="" />
				<h2> React + pdf.js 及 Elasticpdf 部署案例</h2>
				<button className='theme-btn btn-outline-info' onClick={getPDFData}>获取PDF数据</button>
				<button className='theme-btn btn-outline-help' onClick={outputAnnotations}>导出批注</button>
				<button className='theme-btn btn-outline-success' onClick={changeFile}>切换文档</button>
				<button className='theme-btn btn-outline-warning' onClick={setUser}>切换用户</button>
				<button className='theme-btn btn-outline-info' onClick={openOrCloseAnnotatioList}>打开/关闭列表</button>
				<img style={{position:"absolute",right:"20px",height:"100%"}} src="react-static/elasticpdf-logo.png" alt="" />
			</div>
		}
		{
			!is_chinese &&
			<div className='project-title'>
				<img src="react-static/react.png" alt="" />
				<h2> React + pdf.js && Elasticpdf example</h2>
				<button className='theme-btn btn-outline-info' onClick={getPDFData}>Get PDF Data</button>
				<button className='theme-btn btn-outline-help' onClick={outputAnnotations}>Export Annotations</button>
				<button className='theme-btn btn-outline-success' onClick={changeFile}>Change File</button>
				<button className='theme-btn btn-outline-warning' onClick={setUser}>Change User</button>
				<button className='theme-btn btn-outline-info' onClick={openOrCloseAnnotatioList}>Open/Close Anno List</button>
				<img style={{position:"absolute",right:"20px",height:"100%"}} src="react-static/elasticpdf-logo.png" alt="" />
			</div>
		}
		{
			is_elasticpdf && 
			<iframe id='elasticpdf-iframe' onLoad={initialPDFEditor} 
			title='elasticpdf-iframe' src='elasticpdf/web/viewer.html' style={{width:"100%",border:0,height:"700px"}}></iframe>
		}
		{
			!is_elasticpdf && 
			<iframe id='elasticpdf-iframe' onLoad={initialPDFEditor}
			title='elasticpdf-iframe' src='pdfjs-3.2/web/viewer.html' style={{width:"100%",border:0,height:"700px"}}></iframe>
		}
		</div>
	  );
}

export default App;
