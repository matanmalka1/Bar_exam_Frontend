import { useParams } from 'react-router-dom'

const ResultsPage = () => {
  const { id } = useParams()
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-900">תוצאות</h1>
      <p className="mt-2 text-gray-600">מזהה הפעלה: {id}</p>
    </div>
  )
}

export default ResultsPage
