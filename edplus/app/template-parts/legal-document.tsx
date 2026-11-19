"use client";

import type { LegalBlock, LegalDocument, LegalItem } from "@/app/content/legal-documents";

function LegalItemText({ item }: { item: LegalItem }) {
	if (typeof item === "string") return item;
	return (
		<>
			<strong>{item.label}:</strong> {item.text}
		</>
	);
}

function LegalBlocks({ blocks }: { blocks: LegalBlock[] }) {
	return blocks.map((block, index) => {
		if (block.type === "p") {
			return <p key={index}>{block.text}</p>;
		}
		if (block.type === "list") {
			return (
				<ul key={index}>
					{block.items.map((item, itemIndex) => (
						<li key={itemIndex}>
							<LegalItemText item={item} />
						</li>
					))}
				</ul>
			);
		}
		return (
			<ul key={index} className="legal-links">
				{block.items.map((item) => (
					<li key={item.href}>
						<a href={item.href} target="_blank" rel="noopener noreferrer">
							{item.label}
						</a>
					</li>
				))}
			</ul>
		);
	});
}

export default function LegalDocumentView({ document }: { document: LegalDocument }) {
	return (
		<section className="site-content section-padding">
			<div className="container">
				<div className="row">
					<div className="col-xl-8 col-lg-10 mx-auto legal-doc">
						<h2>{document.title}</h2>
						{document.effective ? <p className="legal-effective">{document.effective}</p> : null}
						{document.intro?.map((paragraph, index) => (
							<p key={index}>{paragraph}</p>
						))}
						{document.sections.map((section) => (
							<section key={section.heading}>
								<h3>{section.heading}</h3>
								{section.blocks ? <LegalBlocks blocks={section.blocks} /> : null}
								{section.subsections?.map((subsection) => (
									<div key={subsection.heading}>
										<h4>{subsection.heading}</h4>
										<LegalBlocks blocks={subsection.blocks} />
									</div>
								))}
							</section>
						))}
						{document.closing ? <p>{document.closing}</p> : null}
					</div>
				</div>
			</div>
		</section>
	);
}
