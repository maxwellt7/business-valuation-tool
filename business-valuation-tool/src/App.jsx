import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Calculator, TrendingUp, Building2, Laptop, ShoppingCart, Factory, AlertTriangle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

// Valuation calculation functions
const calculateSDE = (revenue, expenses, ownerSalary, ownerBenefits, discretionaryExpenses) => {
  const netIncome = revenue - expenses
  return netIncome + ownerSalary + ownerBenefits + discretionaryExpenses
}

const calculateEBITDA = (revenue, cogs, operatingExpenses, depreciation) => {
  return revenue - cogs - operatingExpenses + depreciation
}

const calculateAssetValue = (tangibleAssets, intangibleAssets, totalLiabilities) => {
  return tangibleAssets + intangibleAssets - totalLiabilities
}

// Industry multiples database
const industryMultiples = {
  'technology': { sdeMultiple: 3.5, ebitdaMultiple: 8.0, revenueMultiple: 5.5 },
  'saas': { sdeMultiple: 4.0, ebitdaMultiple: 12.0, revenueMultiple: 8.0 },
  'retail': { sdeMultiple: 2.5, ebitdaMultiple: 4.5, revenueMultiple: 0.6 },
  'manufacturing': { sdeMultiple: 3.0, ebitdaMultiple: 6.0, revenueMultiple: 0.8 },
  'services': { sdeMultiple: 2.8, ebitdaMultiple: 5.0, revenueMultiple: 1.2 },
  'healthcare': { sdeMultiple: 3.2, ebitdaMultiple: 7.0, revenueMultiple: 1.5 },
  'construction': { sdeMultiple: 2.2, ebitdaMultiple: 4.0, revenueMultiple: 0.4 },
  'hospitality': { sdeMultiple: 2.0, ebitdaMultiple: 6.5, revenueMultiple: 1.0 },
  'general': { sdeMultiple: 2.5, ebitdaMultiple: 5.0, revenueMultiple: 1.0 }
}

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Business Info
    industry: '',
    businessAge: '',
    businessType: '',
    
    // Financial Data
    annualRevenue: '',
    costOfGoodsSold: '',
    operatingExpenses: '',
    ownerSalary: '',
    ownerBenefits: '',
    discretionaryExpenses: '',
    depreciation: '',
    
    // Assets & Liabilities
    tangibleAssets: '',
    intangibleAssets: '',
    totalLiabilities: '',
    
    // SaaS Specific
    arr: '',
    mrr: '',
    churnRate: '',
    cac: '',
    ltv: '',
    
    // Retail Specific
    sameStoreSales: '',
    inventoryTurnover: '',
    ecommercePenetration: ''
  })
  
  const [valuationResults, setValuationResults] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateValuation = () => {
    setIsCalculating(true)
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const revenue = parseFloat(formData.annualRevenue) || 0
      const cogs = parseFloat(formData.costOfGoodsSold) || 0
      const opEx = parseFloat(formData.operatingExpenses) || 0
      const ownerSal = parseFloat(formData.ownerSalary) || 0
      const ownerBen = parseFloat(formData.ownerBenefits) || 0
      const discExp = parseFloat(formData.discretionaryExpenses) || 0
      const deprec = parseFloat(formData.depreciation) || 0
      const tangAssets = parseFloat(formData.tangibleAssets) || 0
      const intangAssets = parseFloat(formData.intangibleAssets) || 0
      const liabilities = parseFloat(formData.totalLiabilities) || 0
      
      const industry = formData.industry || 'general'
      const multiples = industryMultiples[industry]
      
      // Calculate SDE
      const sde = calculateSDE(revenue, opEx, ownerSal, ownerBen, discExp)
      const sdeValuation = sde * multiples.sdeMultiple
      
      // Calculate EBITDA
      const ebitda = calculateEBITDA(revenue, cogs, opEx, deprec)
      const ebitdaValuation = ebitda * multiples.ebitdaMultiple
      
      // Calculate Asset-based valuation
      const assetValuation = calculateAssetValue(tangAssets, intangAssets, liabilities)
      
      // Calculate Revenue multiple
      const revenueValuation = revenue * multiples.revenueMultiple
      
      // SaaS specific calculations
      let saasValuation = 0
      if (formData.industry === 'saas' && formData.arr) {
        const arr = parseFloat(formData.arr)
        saasValuation = arr * multiples.revenueMultiple
      }
      
      // Determine primary and secondary valuations based on business size and type
      let primaryValuation, secondaryValuation, method
      
      if (revenue < 5000000) {
        primaryValuation = sdeValuation
        secondaryValuation = assetValuation
        method = 'SDE Multiple'
      } else {
        primaryValuation = ebitdaValuation
        secondaryValuation = revenueValuation
        method = 'EBITDA Multiple'
      }
      
      if (formData.industry === 'saas' && saasValuation > 0) {
        primaryValuation = saasValuation
        method = 'ARR Multiple'
      }
      
      const lowEstimate = Math.min(primaryValuation, secondaryValuation) * 0.8
      const highEstimate = Math.max(primaryValuation, secondaryValuation) * 1.2
      
      setValuationResults({
        primaryValuation,
        secondaryValuation,
        assetValuation,
        lowEstimate,
        highEstimate,
        method,
        sde,
        ebitda,
        multiples
      })
      
      setIsCalculating(false)
      setCurrentStep(4)
    }, 2000)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getIndustryIcon = (industry) => {
    switch (industry) {
      case 'technology':
      case 'saas':
        return <Laptop className="h-5 w-5" />
      case 'retail':
        return <ShoppingCart className="h-5 w-5" />
      case 'manufacturing':
        return <Factory className="h-5 w-5" />
      default:
        return <Building2 className="h-5 w-5" />
    }
  }

  const progress = (currentStep / 4) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Calculator className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Business Valuation Tool
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get a professional estimate of your business value using industry-standard methodologies
          </p>
          <div className="mt-4">
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-gray-500 mt-2">Step {currentStep} of 4</p>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-6 w-6 mr-2" />
                      Business Information
                    </CardTitle>
                    <CardDescription>
                      Tell us about your business to customize the valuation approach
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="saas">Software as a Service (SaaS)</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="services">Professional Services</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="hospitality">Hospitality</SelectItem>
                            <SelectItem value="general">Other/General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="businessAge">Years in Business</Label>
                        <Select value={formData.businessAge} onValueChange={(value) => updateFormData('businessAge', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business age" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="2-5">2-5 years</SelectItem>
                            <SelectItem value="6-10">6-10 years</SelectItem>
                            <SelectItem value="11-20">11-20 years</SelectItem>
                            <SelectItem value="20+">20+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select value={formData.businessType} onValueChange={(value) => updateFormData('businessType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="llc">Limited Liability Company (LLC)</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="s-corp">S Corporation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setCurrentStep(2)}
                        disabled={!formData.industry}
                        className="px-8"
                      >
                        Next: Financial Information
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-6 w-6 mr-2" />
                      Financial Information
                    </CardTitle>
                    <CardDescription>
                      Enter your financial data for the most recent 12 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="basic">Basic Financials</TabsTrigger>
                        <TabsTrigger value="detailed">Detailed Breakdown</TabsTrigger>
                        <TabsTrigger value="specific">Industry Specific</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="annualRevenue">Annual Revenue</Label>
                            <Input
                              id="annualRevenue"
                              type="number"
                              placeholder="1000000"
                              value={formData.annualRevenue}
                              onChange={(e) => updateFormData('annualRevenue', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="operatingExpenses">Total Operating Expenses</Label>
                            <Input
                              id="operatingExpenses"
                              type="number"
                              placeholder="750000"
                              value={formData.operatingExpenses}
                              onChange={(e) => updateFormData('operatingExpenses', e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="detailed" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="costOfGoodsSold">Cost of Goods Sold</Label>
                            <Input
                              id="costOfGoodsSold"
                              type="number"
                              placeholder="400000"
                              value={formData.costOfGoodsSold}
                              onChange={(e) => updateFormData('costOfGoodsSold', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="ownerSalary">Owner Salary</Label>
                            <Input
                              id="ownerSalary"
                              type="number"
                              placeholder="100000"
                              value={formData.ownerSalary}
                              onChange={(e) => updateFormData('ownerSalary', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="ownerBenefits">Owner Benefits</Label>
                            <Input
                              id="ownerBenefits"
                              type="number"
                              placeholder="25000"
                              value={formData.ownerBenefits}
                              onChange={(e) => updateFormData('ownerBenefits', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="discretionaryExpenses">Discretionary Expenses</Label>
                            <Input
                              id="discretionaryExpenses"
                              type="number"
                              placeholder="15000"
                              value={formData.discretionaryExpenses}
                              onChange={(e) => updateFormData('discretionaryExpenses', e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="depreciation">Depreciation & Amortization</Label>
                            <Input
                              id="depreciation"
                              type="number"
                              placeholder="50000"
                              value={formData.depreciation}
                              onChange={(e) => updateFormData('depreciation', e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="specific" className="space-y-4">
                        {formData.industry === 'saas' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="arr">Annual Recurring Revenue (ARR)</Label>
                              <Input
                                id="arr"
                                type="number"
                                placeholder="800000"
                                value={formData.arr}
                                onChange={(e) => updateFormData('arr', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="churnRate">Monthly Churn Rate (%)</Label>
                              <Input
                                id="churnRate"
                                type="number"
                                placeholder="3"
                                value={formData.churnRate}
                                onChange={(e) => updateFormData('churnRate', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cac">Customer Acquisition Cost</Label>
                              <Input
                                id="cac"
                                type="number"
                                placeholder="2500"
                                value={formData.cac}
                                onChange={(e) => updateFormData('cac', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="ltv">Customer Lifetime Value</Label>
                              <Input
                                id="ltv"
                                type="number"
                                placeholder="16000"
                                value={formData.ltv}
                                onChange={(e) => updateFormData('ltv', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        
                        {formData.industry === 'retail' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="sameStoreSales">Same-Store Sales Growth (%)</Label>
                              <Input
                                id="sameStoreSales"
                                type="number"
                                placeholder="5"
                                value={formData.sameStoreSales}
                                onChange={(e) => updateFormData('sameStoreSales', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="inventoryTurnover">Inventory Turnover Ratio</Label>
                              <Input
                                id="inventoryTurnover"
                                type="number"
                                placeholder="6"
                                value={formData.inventoryTurnover}
                                onChange={(e) => updateFormData('inventoryTurnover', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="ecommercePenetration">E-commerce Penetration (%)</Label>
                              <Input
                                id="ecommercePenetration"
                                type="number"
                                placeholder="30"
                                value={formData.ecommercePenetration}
                                onChange={(e) => updateFormData('ecommercePenetration', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        
                        {!['saas', 'retail'].includes(formData.industry) && (
                          <div className="text-center py-8 text-gray-500">
                            <p>No industry-specific metrics required for {formData.industry}</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        Back
                      </Button>
                      <Button 
                        onClick={() => setCurrentStep(3)}
                        disabled={!formData.annualRevenue}
                        className="px-8"
                      >
                        Next: Assets & Liabilities
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="h-6 w-6 mr-2" />
                      Assets & Liabilities
                    </CardTitle>
                    <CardDescription>
                      Provide information about your business assets and liabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="tangibleAssets">Tangible Assets</Label>
                        <Input
                          id="tangibleAssets"
                          type="number"
                          placeholder="500000"
                          value={formData.tangibleAssets}
                          onChange={(e) => updateFormData('tangibleAssets', e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          Equipment, inventory, real estate, cash
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="intangibleAssets">Intangible Assets</Label>
                        <Input
                          id="intangibleAssets"
                          type="number"
                          placeholder="100000"
                          value={formData.intangibleAssets}
                          onChange={(e) => updateFormData('intangibleAssets', e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          Patents, trademarks, goodwill, customer lists
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="totalLiabilities">Total Liabilities</Label>
                        <Input
                          id="totalLiabilities"
                          type="number"
                          placeholder="200000"
                          value={formData.totalLiabilities}
                          onChange={(e) => updateFormData('totalLiabilities', e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          Loans, accounts payable, accrued expenses
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        Back
                      </Button>
                      <Button 
                        onClick={calculateValuation}
                        className="px-8"
                        disabled={isCalculating}
                      >
                        {isCalculating ? 'Calculating...' : 'Calculate Valuation'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 4 && valuationResults && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                      Valuation Results
                    </CardTitle>
                    <CardDescription>
                      Your business valuation based on industry-standard methodologies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Primary Valuation */}
                      <div className="space-y-4">
                        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                          <div className="flex items-center justify-center mb-2">
                            {getIndustryIcon(formData.industry)}
                            <Badge variant="secondary" className="ml-2">
                              {valuationResults.method}
                            </Badge>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Primary Valuation
                          </h3>
                          <p className="text-4xl font-bold text-blue-600">
                            {formatCurrency(valuationResults.primaryValuation)}
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-semibold mb-2">Valuation Range</h4>
                          <p className="text-lg">
                            {formatCurrency(valuationResults.lowEstimate)} - {formatCurrency(valuationResults.highEstimate)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Valuation Breakdown</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <span>Asset-Based Value</span>
                            <span className="font-semibold">{formatCurrency(valuationResults.assetValuation)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <span>Secondary Valuation</span>
                            <span className="font-semibold">{formatCurrency(valuationResults.secondaryValuation)}</span>
                          </div>
                          
                          {valuationResults.sde > 0 && (
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <span>SDE</span>
                              <span className="font-semibold">{formatCurrency(valuationResults.sde)}</span>
                            </div>
                          )}
                          
                          {valuationResults.ebitda > 0 && (
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <span>EBITDA</span>
                              <span className="font-semibold">{formatCurrency(valuationResults.ebitda)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Disclaimer */}
                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <p className="font-semibold mb-1">Important Disclaimer</p>
                          <p>
                            This valuation is an estimate based on the information provided and industry averages. 
                            Actual business value may vary significantly based on market conditions, buyer motivations, 
                            and factors not captured in this analysis. For important business decisions, consult with 
                            a qualified business valuation professional.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        Start New Valuation
                      </Button>
                      <Button onClick={() => window.print()}>
                        Print Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default App

