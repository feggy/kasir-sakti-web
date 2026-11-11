import { Footer, Header } from "@/components/kerangka";

/** Kerangka halaman teks legal (kebijakan privasi, syarat & ketentuan). Isi ditulis sebagai JSX biasa. */
export function HalamanLegal({ judul, berlaku, children }: { judul: string; berlaku: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="bg-tint">
        <div className="mx-auto w-full max-w-3xl px-5 pt-14 pb-24 sm:px-8 lg:pt-20">
          <p className="text-sm text-muted">Berlaku sejak {berlaku}</p>
          <h1 className="mt-2 text-[34px] leading-tight font-extrabold tracking-[-0.03em] sm:text-5xl">{judul}</h1>
          <article className="legal mt-10 rounded-[28px] bg-white p-6 ring-1 ring-line sm:p-10">{children}</article>
        </div>
      </main>
      <Footer />
    </>
  );
}
