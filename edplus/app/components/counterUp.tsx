"use client";

import Image from "next/image";
import {
	isExternal,
	useBlockContent,
	type BlockData,
} from "@/app/components/page-blocks/use-block-content";

export default function CounterUp({
	className = "",
	data,
}: {
	className?: string;
	data?: BlockData;
}) {
	const { list, itemText } = useBlockContent("counter", data);
	const items = list("items");

	return (
		<section className={`counter-up position-relative z-1 ${className}`}>
			<div className="container my-5">
				<div className="counter_bg">
					<div className="row">
						{items.map((item, index) => {
							const icon = itemText(item, "icon");
							return (
								<div
									key={index}
									className={`col-xxl-3 col-xl-4 col-md-6 col-12 mx-xl-auto wow fadeInUp${
										index === 3 ? " d-xl-none d-xxl-block" : ""
									}`}
								>
									<div className="counter-item">
										{icon ? (
											<div className="coicon">
												<Image
													src={icon}
													alt=""
													width={40}
													height={32}
													className="d-inline-block"
													unoptimized={isExternal(icon)}
												/>
											</div>
										) : null}

										<div className="ccontent">
											<h3>
												<span className="count">{itemText(item, "value")}</span>
												{itemText(item, "suffix")}
											</h3>
											<span>{itemText(item, "label")}</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
