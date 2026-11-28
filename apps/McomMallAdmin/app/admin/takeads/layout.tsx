import { TakeadsNav } from './components/TakeadsNav';

export default function TakeadsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <TakeadsNav />
            {children}
        </div>
    );
}
