
interface WelcomeBoardProps {
  userName: string;
}
export const WelcomeBoard = ({
  userName
}: WelcomeBoardProps) => {
  return <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4" style={{
      fontFamily: "'Inter', sans-serif",
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
    }}>
        Hello, {userName}
      </h1>
      <p className="text-blue-100 text-lg md:text-xl max-w-lg mx-auto">
        Your personal markdown dashboard. Create, join, or resume editing documents anytime.
      </p>
    </div>;
};