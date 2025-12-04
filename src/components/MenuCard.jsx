import { BlurFade } from "./magicui/blur-fade";
import { Card } from "./ui/card";

const MenuCard = ({
  index,
  item,
  className,
  textcolor,
  onCardClick,
  total,
  disabled,
}) => {
  return (
    <BlurFade
      delay={total > 4 ? 0.1 * index : 0.25 * index}
      inView
      className="flex flex-col gap-2 justify-center items-center self-stretch w-full min-w-60 tl6:p-2"
    >
      <Card
        className={`flex relative flex-col flex-grow gap-2 justify-center items-center self-stretch p-2 shadow-xl cursor-pointer ${className} ${
          disabled ? "opacity-70 saturate-50 blur-[1px]" : ""}`}
        onClick={() => !disabled && onCardClick(item)}
      >
        <div className="flex flex-grow gap-2 justify-center items-center self-stretch p-2">
          <div className="grid flex-grow grid-rows-3 py-2 space-y-4 md:py-6">
            <div className="flex row-span-1 justify-center items-center w-full">
              <div className="w-24 h-24 tl6:w-28 tl6:h-28 aspect-square">
                <img
                  src={`/images/${item.name}.svg`}
                  alt={item.name}
                  className="aspect-square"
                />
              </div>
            </div>
            <div className="flex flex-col row-span-1 items-center text-center opacity-80 tl6:text-xl">
              <p>{item.description[0]}</p>
              <p>{item.description[1]}</p>
            </div>
            <div
              className={`flex flex-col row-span-1 justify-center self-stretch text-4xl font-extrabold leading-none text-center md:text-6xl tl6:text-6xl ${textcolor}`}
            >
              {item.title}
            </div>
          </div>
        </div>
      </Card>
      {disabled && (
        <div className="absolute right-5 bottom-8 w-1/2 -rotate-[16deg]">
          {/* <div className="absolute inset-0 w-full h-full bg-primary mask-complete"></div> */}
          <img
            src="/thumbs-up_filled.png"
            alt="완료"
            className="w-full h-full drop-shadow-lg"
          />
        </div>
      )}
    </BlurFade>
  );
};

export default MenuCard;
