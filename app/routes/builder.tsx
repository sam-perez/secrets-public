import BuilderFooter from "~/components/sends/builder/footer";

import BuilderFields from "~/components/sends/builder/fields";
import BuilderWrapper from "~/components/sends/builder/wrapper";

export default function Builder() {
  return (
    <>
      <div className="max-w-2xl mx-auto mt-10">
        {/* new builder */}
        <div className="max-w-2xl mx-auto mt-10">
          <BuilderWrapper>
            <BuilderFields />
            <BuilderFooter />
          </BuilderWrapper>
        </div>
      </div>
    </>
  );
}
