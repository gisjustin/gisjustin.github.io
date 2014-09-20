Imports Microsoft.VisualBasic
Imports System.data
Imports System.Data.OleDb

Public Class clsConsSel
    Function getConnectionString()
        'Return "Provider=Microsoft.Jet.OLEDB.4.0;Data Source='D:\My Documents\HighlyUsedItems\Project Folders\WirelessSurvey\SurveyDB.mdb'"
        Return "Provider=Microsoft.Jet.OLEDB.4.0;Data Source='\SurveyDb.mdb'"
        'Return "Provider=Microsoft.Jet.OLEDB.4.0;Data Source='D:\dbs\WirelessSurvey\SurveyDB.mdb'"

    End Function
 
    Public Function GetAgencies() As DataSet
        'Gets the address, phone, etc for the submitting consultant
        Dim myconn As New OleDb.OleDbConnection(getConnectionString())
        Dim da As OleDbDataAdapter = New OleDbDataAdapter("SELECT Distinct SurveyInput.Agency FROM SurveyInput", myconn)
        Dim ds As New DataSet
        da.Fill(ds, "Agencies")
        Return ds
    End Function
    Public Function GetDivisions(ByVal strAgency) As DataSet
        'Gets the address, phone, etc for the submitting consultant
        Dim myconn As New OleDb.OleDbConnection(getConnectionString())
        Dim da As OleDbDataAdapter = New OleDbDataAdapter("SELECT Distinct SurveyInput.Division FROM(SurveyInput) WHERE (((SurveyInput.Agency)='" & Replace(strAgency, "'", "''") & "'))", myconn)
        Dim ds As New DataSet
        da.Fill(ds, "Divisions")
        Return ds
    End Function

    Public Function GetLocations(ByVal strAgency, ByVal strDivision) As DataSet
        Dim strSQL As String
        Dim myconn As New OleDb.OleDbConnection(getConnectionString())
        strSQL = "SELECT * FROM(SurveyInput) WHERE (((SurveyInput.Agency)='" & Replace(strAgency, "'", "''") & "') AND ((SurveyInput.Division)='" & Replace(strDivision, "'", "''") & "'))"
        Dim da As OleDbDataAdapter = New OleDbDataAdapter(strSQL, myconn)
        Dim ds As New DataSet
        da.Fill(ds, "locations")
        Return ds
    End Function
    Public Function GetAgencyComments(ByVal strAgency) As DataSet
        Dim strSQL As String
        Dim myconn As New OleDb.OleDbConnection(getConnectionString())
        strSQL = "SELECT SurveyAgencies.AgencyComments, SurveyAgencies.EstimatedNomadicSites, SurveyAgencies.SurveyorFName, SurveyAgencies.SurveyorLName FROM(SurveyAgencies) WHERE (((SurveyAgencies.AgencyName)='" & Replace(strAgency, "'", "''") & "'))"
        Dim da As OleDbDataAdapter = New OleDbDataAdapter(strSQL, myconn)
        Dim ds As New DataSet
        da.Fill(ds, "comments")
        Return ds
    End Function
End Class
